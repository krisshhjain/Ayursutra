import PractitionerAvailability from '../models/PractitionerAvailability.js';
import Appointment from '../models/Appointment.js';
import UnavailableDate from '../models/UnavailableDate.js';

/**
 * Generate available time slots for a practitioner on a specific date
 * @param {string} practitionerId - MongoDB ObjectId of the practitioner
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object} options - Override options for slot generation
 * @param {number} options.slotLength - Slot length in minutes
 * @param {number} options.bufferBefore - Buffer before in minutes
 * @param {number} options.bufferAfter - Buffer after in minutes
 * @returns {Array} Array of slot objects with availability info
 */
export async function generateSlots(practitionerId, date, options = {}) {
  try {
    // Get practitioner availability or create default
    const availability = await PractitionerAvailability.getOrCreateForPractitioner(practitionerId);
    
    // Override with provided options
    const slotLength = options.slotLength || availability.slotLength;
    const bufferBefore = options.bufferBefore ?? availability.bufferBefore;
    const bufferAfter = options.bufferAfter ?? availability.bufferAfter;
    const timezone = availability.timezone;

    // Parse the date and get weekday
    const targetDate = new Date(date + 'T00:00:00.000Z');
    const weekday = targetDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

    // Check if practitioner has marked this date as unavailable
    const isDateUnavailable = await UnavailableDate.isDateUnavailable(practitionerId, date);
    if (isDateUnavailable) {
      return {
        date,
        timezone,
        slots: [],
        message: 'Practitioner is not available on this date'
      };
    }

    // Check if practitioner works on this weekday
    const workingHours = availability.getWorkingHours(weekday);
    if (!workingHours) {
      return {
        date,
        timezone,
        slots: [],
        message: 'Practitioner does not work on this day'
      };
    }

    // Check for exceptions on this date
    const exception = availability.getExceptionForDate(date);
    let availableWindows = [];

    if (exception) {
      if (exception.type === 'block') {
        return {
          date,
          timezone,
          slots: [],
          message: 'Practitioner is not available on this date'
        };
      } else if (exception.type === 'partial' && exception.start && exception.end) {
        // Use exception hours instead of regular working hours
        availableWindows = [{
          start: exception.start,
          end: exception.end
        }];
      } else {
        // Use regular working hours
        availableWindows = [{
          start: workingHours.start,
          end: workingHours.end
        }];
      }
    } else {
      // Use regular working hours
      availableWindows = [{
        start: workingHours.start,
        end: workingHours.end
      }];
    }

    // Get existing appointments for this practitioner on this date
    const existingAppointments = await Appointment.find({
      practitionerId,
      date,
      status: { $in: ['requested', 'confirmed', 'rescheduled'] }
    }).sort({ slotStartUtc: 1 });

    // Generate all possible slots
    const allSlots = [];
    
    for (const window of availableWindows) {
      const windowSlots = generateSlotsForWindow(
        date, 
        window.start, 
        window.end, 
        slotLength, 
        bufferBefore, 
        bufferAfter, 
        timezone
      );
      allSlots.push(...windowSlots);
    }

    // Mark slots as unavailable if they conflict with existing appointments
    const slotsWithAvailability = allSlots.map(slot => {
      const isAvailable = !hasConflictWithAppointments(
        slot.slotStartUtc, 
        slot.slotEndUtc, 
        existingAppointments, 
        bufferBefore, 
        bufferAfter
      );

      return {
        ...slot,
        available: isAvailable,
        reason: isAvailable ? null : 'Time slot is already booked'
      };
    });

    return {
      date,
      timezone,
      slots: slotsWithAvailability
    };

  } catch (error) {
    console.error('Error generating slots:', error);
    throw new Error('Failed to generate slots: ' + error.message);
  }
}

/**
 * Generate slots for a specific time window
 */
function generateSlotsForWindow(date, startTime, endTime, slotLength, bufferBefore, bufferAfter, timezone) {
  const slots = [];
  
  // Convert date and times to UTC
  const dateStr = date; // YYYY-MM-DD format
  const startDateTime = new Date(`${dateStr}T${startTime}:00.000`);
  const endDateTime = new Date(`${dateStr}T${endTime}:00.000`);
  
  // TODO: Proper timezone conversion would require a library like moment-timezone
  // For now, assuming local time is close to the practitioner's timezone
  // In production, implement proper timezone conversion
  
  let currentSlotStart = new Date(startDateTime);
  
  // Add buffer before first slot
  currentSlotStart.setMinutes(currentSlotStart.getMinutes() + bufferBefore);
  
  while (true) {
    const slotEnd = new Date(currentSlotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotLength);
    
    // Check if this slot (plus buffer after) fits within the window
    const slotEndWithBuffer = new Date(slotEnd);
    slotEndWithBuffer.setMinutes(slotEndWithBuffer.getMinutes() + bufferAfter);
    
    if (slotEndWithBuffer > endDateTime) {
      break;
    }
    
    // Format local times for display
    const startLocal = formatTimeLocal(currentSlotStart);
    const endLocal = formatTimeLocal(slotEnd);
    
    slots.push({
      startTime: new Date(currentSlotStart).toISOString(),
      endTime: new Date(slotEnd).toISOString(),
      available: true,
      duration: slotLength,
      // Keep original fields for backward compatibility
      slotStartUtc: new Date(currentSlotStart),
      slotEndUtc: new Date(slotEnd),
      startLocal,
      endLocal
    });
    
    // Move to next slot (current slot + buffer after + buffer before next slot)
    currentSlotStart = new Date(slotEnd);
    currentSlotStart.setMinutes(currentSlotStart.getMinutes() + bufferAfter + bufferBefore);
  }
  
  return slots;
}

/**
 * Check if a proposed slot conflicts with existing appointments
 */
function hasConflictWithAppointments(proposedStart, proposedEnd, existingAppointments, bufferBefore, bufferAfter) {
  const proposedStartWithBuffer = new Date(proposedStart);
  proposedStartWithBuffer.setMinutes(proposedStartWithBuffer.getMinutes() - bufferBefore);
  
  const proposedEndWithBuffer = new Date(proposedEnd);
  proposedEndWithBuffer.setMinutes(proposedEndWithBuffer.getMinutes() + bufferAfter);
  
  return existingAppointments.some(appointment => {
    const existingStart = new Date(appointment.slotStartUtc);
    const existingEnd = new Date(appointment.slotEndUtc);
    
    // Add buffers to existing appointment
    existingStart.setMinutes(existingStart.getMinutes() - bufferBefore);
    existingEnd.setMinutes(existingEnd.getMinutes() + bufferAfter);
    
    // Check for overlap
    return (proposedStartWithBuffer < existingEnd && proposedEndWithBuffer > existingStart);
  });
}

/**
 * Format time for local display (HH:MM format)
 */
function formatTimeLocal(date) {
  return date.toTimeString().slice(0, 5); // Extract HH:MM
}

/**
 * Validate if a specific slot is available for booking
 * @param {string} practitionerId 
 * @param {string} date 
 * @param {Date} slotStartUtc 
 * @param {Date} slotEndUtc 
 * @returns {Object} Validation result with isValid and reason
 */
export async function validateSlotAvailability(practitionerId, date, slotStartUtc, slotEndUtc) {
  try {
    const slots = await generateSlots(practitionerId, date);
    
    const matchingSlot = slots.slots.find(slot => 
      slot.slotStartUtc.getTime() === slotStartUtc.getTime() && 
      slot.slotEndUtc.getTime() === slotEndUtc.getTime()
    );
    
    if (!matchingSlot) {
      return {
        isValid: false,
        reason: 'Requested time slot is not available in practitioner schedule'
      };
    }
    
    if (!matchingSlot.available) {
      return {
        isValid: false,
        reason: matchingSlot.reason || 'Time slot is not available'
      };
    }
    
    return {
      isValid: true,
      reason: null
    };
    
  } catch (error) {
    console.error('Error validating slot availability:', error);
    return {
      isValid: false,
      reason: 'Unable to validate slot availability'
    };
  }
}

/**
 * Get next available slots for a practitioner starting from a given date
 * @param {string} practitionerId 
 * @param {string} startDate 
 * @param {number} count 
 * @returns {Array} Next available slots
 */
export async function getNextAvailableSlots(practitionerId, startDate, count = 5) {
  const nextSlots = [];
  const maxDaysToCheck = 30;
  let currentDate = new Date(startDate + 'T00:00:00.000Z');
  
  for (let i = 0; i < maxDaysToCheck && nextSlots.length < count; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    try {
      const daySlots = await generateSlots(practitionerId, dateStr);
      const availableSlots = daySlots.slots.filter(slot => slot.available);
      
      for (const slot of availableSlots) {
        if (nextSlots.length < count) {
          nextSlots.push({
            ...slot,
            date: dateStr
          });
        }
      }
    } catch (error) {
      console.error(`Error getting slots for ${dateStr}:`, error);
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return nextSlots;
}

export default {
  generateSlots,
  validateSlotAvailability,
  getNextAvailableSlots
};