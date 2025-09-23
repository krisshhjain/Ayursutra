import TherapyTemplate from '../models/TherapyTemplate.js';
import TherapyProgram from '../models/TherapyProgram.js';
import Appointment from '../models/Appointment.js';
import { User } from '../models/User.js';
import PractitionerAvailability from '../models/PractitionerAvailability.js';

class TherapySchedulingService {
  /**
   * Create a new therapy program for a patient
   */
  static async createTherapyProgram(patientId, templateId, primaryPractitionerId, startDate, preferences = {}) {
    try {
      // Validate inputs
      const template = await TherapyTemplate.findById(templateId);
      if (!template) {
        throw new Error('Therapy template not found');
      }

      const patient = await User.findById(patientId);
      if (!patient || patient.userType !== 'patient') {
        throw new Error('Patient not found');
      }

      const practitioner = await User.findById(primaryPractitionerId);
      if (!practitioner || practitioner.userType !== 'practitioner') {
        throw new Error('Practitioner not found');
      }

      // Check if patient already has an active program of this type
      const existingProgram = await TherapyProgram.findOne({
        patientId,
        templateId,
        status: { $in: ['scheduled', 'active'] }
      });

      if (existingProgram) {
        throw new Error('Patient already has an active program of this type');
      }

      // Calculate program timeline
      const programStartDate = new Date(startDate);
      const expectedEndDate = new Date(programStartDate);
      expectedEndDate.setDate(expectedEndDate.getDate() + template.totalDuration);

      // Generate session schedule
      const sessions = await this.generateSessionSchedule(
        template, 
        programStartDate, 
        primaryPractitionerId, 
        preferences
      );

      // Create the therapy program
      const therapyProgram = new TherapyProgram({
        patientId,
        templateId,
        programName: template.name,
        category: template.category,
        startDate: programStartDate,
        expectedEndDate,
        primaryPractitionerId,
        sessions,
        progress: {
          completedSessions: 0,
          totalSessions: sessions.length,
          percentageComplete: 0,
          nextSessionDate: sessions[0]?.scheduledDate,
          nextSessionTime: sessions[0]?.scheduledTime
        },
        billing: {
          totalCost: template.estimatedCost.amount,
          paidAmount: 0,
          paymentStatus: 'pending'
        }
      });

      await therapyProgram.save();

      // Create individual appointments for each session
      await this.createAppointmentsForSessions(therapyProgram);

      return therapyProgram;
    } catch (error) {
      throw new Error(`Failed to create therapy program: ${error.message}`);
    }
  }

  /**
   * Generate session schedule based on template and constraints
   */
  static async generateSessionSchedule(template, startDate, practitionerId, preferences = {}) {
    const sessions = [];
    let currentDate = new Date(startDate);
    
    // Default preferences
    const defaultPrefs = {
      preferredTimeSlot: '10:00', // Default start time
      preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], // Weekdays
      allowWeekends: false,
      bufferDays: 1 // Minimum days between sessions
    };
    
    const prefs = { ...defaultPrefs, ...preferences };

    for (let i = 0; i < template.sessions.length; i++) {
      const sessionTemplate = template.sessions[i];
      
      // Find next available slot for this session
      const scheduledDateTime = await this.findNextAvailableSlot(
        currentDate,
        practitionerId,
        sessionTemplate.duration,
        prefs
      );

      if (!scheduledDateTime) {
        throw new Error(`Unable to schedule session ${i + 1}: No available slots found`);
      }

      const session = {
        sessionNumber: sessionTemplate.sessionNumber,
        templateSessionId: sessionTemplate._id,
        scheduledDate: scheduledDateTime.date,
        scheduledTime: scheduledDateTime.time,
        duration: sessionTemplate.duration,
        status: 'scheduled',
        practitionerId
      };

      sessions.push(session);

      // Calculate next session start date based on gap requirements
      const minGap = sessionTemplate.minimumGapDays || 1;
      const nextSessionDate = new Date(scheduledDateTime.date);
      nextSessionDate.setDate(nextSessionDate.getDate() + minGap);
      currentDate = nextSessionDate;
    }

    return sessions;
  }

  /**
   * Find next available time slot for a session
   */
  static async findNextAvailableSlot(fromDate, practitionerId, duration, preferences) {
    const maxDaysToCheck = 30; // Look ahead up to 30 days
    let currentDate = new Date(fromDate);
    
    for (let dayOffset = 0; dayOffset < maxDaysToCheck; dayOffset++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() + dayOffset);
      
      // Skip weekends if not allowed
      const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 6 = Saturday
      if (!preferences.allowWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }

      // Check day of week preferences
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      if (!preferences.preferredDays.includes(dayName)) {
        continue;
      }

      // Get practitioner availability for this date
      const availability = await this.getPractitionerAvailability(practitionerId, checkDate);
      if (!availability || availability.length === 0) {
        continue;
      }

      // Find suitable time slot
      const timeSlot = this.findTimeSlotInDay(availability, duration, preferences.preferredTimeSlot);
      if (timeSlot) {
        return {
          date: checkDate,
          time: timeSlot
        };
      }
    }

    return null; // No available slot found
  }

  /**
   * Get practitioner availability for a specific date
   */
  static async getPractitionerAvailability(practitionerId, date) {
    try {
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      
      // Get general availability pattern
      const availability = await PractitionerAvailability.findOne({
        practitionerId,
        dayOfWeek,
        isActive: true
      });

      if (!availability) {
        return [];
      }

      // Get existing appointments for this date to exclude booked slots
      const dateStr = date.toISOString().split('T')[0];
      const existingAppointments = await Appointment.find({
        practitionerId,
        date: {
          $gte: new Date(dateStr + 'T00:00:00.000Z'),
          $lt: new Date(dateStr + 'T23:59:59.999Z')
        },
        status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
      });

      // Generate available time slots
      const availableSlots = this.generateAvailableSlots(
        availability.timeSlots,
        existingAppointments,
        date
      );

      return availableSlots;
    } catch (error) {
      console.error('Error getting practitioner availability:', error);
      return [];
    }
  }

  /**
   * Generate available time slots excluding booked appointments
   */
  static generateAvailableSlots(availabilitySlots, existingAppointments, date) {
    const availableSlots = [];
    
    availabilitySlots.forEach(slot => {
      if (!slot.isAvailable) return;
      
      const startTime = this.parseTime(slot.startTime);
      const endTime = this.parseTime(slot.endTime);
      const slotDuration = 30; // 30-minute slots
      
      let currentTime = startTime;
      while (currentTime < endTime) {
        const slotStartTime = this.formatTime(currentTime);
        const slotEndTime = this.formatTime(currentTime + slotDuration);
        
        // Check if this slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          const aptStart = this.parseTime(apt.time);
          const aptEnd = aptStart + apt.duration;
          
          return (currentTime < aptEnd && (currentTime + slotDuration) > aptStart);
        });
        
        if (!hasConflict) {
          availableSlots.push({
            startTime: slotStartTime,
            endTime: slotEndTime,
            duration: slotDuration
          });
        }
        
        currentTime += slotDuration;
      }
    });
    
    return availableSlots;
  }

  /**
   * Find suitable time slot within a day
   */
  static findTimeSlotInDay(availableSlots, requiredDuration, preferredTime) {
    // Try to find slot at preferred time first
    if (preferredTime) {
      const preferredSlot = availableSlots.find(slot => {
        return slot.startTime === preferredTime && 
               this.parseTime(slot.endTime) - this.parseTime(slot.startTime) >= requiredDuration;
      });
      
      if (preferredSlot) {
        return preferredSlot.startTime;
      }
    }

    // Find any suitable slot
    for (const slot of availableSlots) {
      const slotDuration = this.parseTime(slot.endTime) - this.parseTime(slot.startTime);
      if (slotDuration >= requiredDuration) {
        return slot.startTime;
      }
    }

    return null;
  }

  /**
   * Create appointments for all sessions in a therapy program
   */
  static async createAppointmentsForSessions(therapyProgram) {
    const appointments = [];
    
    for (const session of therapyProgram.sessions) {
      const appointment = new Appointment({
        patientId: therapyProgram.patientId,
        practitionerId: session.practitionerId,
        date: session.scheduledDate,
        time: session.scheduledTime,
        duration: session.duration,
        type: 'therapy',
        therapyType: therapyProgram.category,
        status: 'scheduled',
        notes: `${therapyProgram.programName} - Session ${session.sessionNumber}`,
        therapyProgramId: therapyProgram._id,
        sessionNumber: session.sessionNumber
      });
      
      await appointment.save();
      session.appointmentId = appointment._id;
      appointments.push(appointment);
    }
    
    // Update the therapy program with appointment IDs
    await therapyProgram.save();
    
    return appointments;
  }

  /**
   * Reschedule a therapy session
   */
  static async rescheduleSession(programId, sessionNumber, newDate, newTime, rescheduledBy, reason) {
    try {
      const program = await TherapyProgram.findById(programId);
      if (!program) {
        throw new Error('Therapy program not found');
      }

      const session = program.sessions.find(s => s.sessionNumber === sessionNumber);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status === 'completed') {
        throw new Error('Cannot reschedule completed session');
      }

      // Check availability at new time
      const isAvailable = await this.checkSlotAvailability(
        session.practitionerId, 
        newDate, 
        newTime, 
        session.duration
      );

      if (!isAvailable) {
        throw new Error('Selected time slot is not available');
      }

      // Store rescheduling history
      session.reschedulingHistory.push({
        originalDate: session.scheduledDate,
        originalTime: session.scheduledTime,
        newDate: new Date(newDate),
        newTime,
        reason,
        rescheduledBy
      });

      // Update session details
      session.scheduledDate = new Date(newDate);
      session.scheduledTime = newTime;
      session.status = 'rescheduled';

      // Update related appointment
      if (session.appointmentId) {
        await Appointment.findByIdAndUpdate(session.appointmentId, {
          date: new Date(newDate),
          time: newTime,
          status: 'rescheduled'
        });
      }

      await program.updateProgress();
      return program;
    } catch (error) {
      throw new Error(`Failed to reschedule session: ${error.message}`);
    }
  }

  /**
   * Check if a time slot is available
   */
  static async checkSlotAvailability(practitionerId, date, time, duration) {
    const startTime = this.parseTime(time);
    const endTime = startTime + duration;
    
    const dateStr = new Date(date).toISOString().split('T')[0];
    const conflictingAppointments = await Appointment.find({
      practitionerId,
      date: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lt: new Date(dateStr + 'T23:59:59.999Z')
      },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    });

    // Check for conflicts
    for (const apt of conflictingAppointments) {
      const aptStart = this.parseTime(apt.time);
      const aptEnd = aptStart + apt.duration;
      
      if (startTime < aptEnd && endTime > aptStart) {
        return false; // Conflict found
      }
    }

    return true;
  }

  /**
   * Utility methods for time parsing and formatting
   */
  static parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes since midnight
  }

  static formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get therapy programs for dashboard
   */
  static async getTherapyProgramsForPatient(patientId, status = null) {
    const query = { patientId };
    if (status) {
      query.status = status;
    }

    return await TherapyProgram.find(query)
      .populate('templateId primaryPractitionerId')
      .sort({ createdAt: -1 });
  }

  /**
   * Get therapy programs for practitioner
   */
  static async getTherapyProgramsForPractitioner(practitionerId, status = null) {
    return await TherapyProgram.findForPractitioner(practitionerId, status);
  }

  /**
   * Get upcoming therapy sessions
   */
  static async getUpcomingTherapySessions(userId, userType, limit = 10) {
    const query = userType === 'patient' 
      ? { patientId: userId }
      : { 
          $or: [
            { primaryPractitionerId: userId },
            { 'assistingPractitioners.practitionerId': userId }
          ]
        };

    const programs = await TherapyProgram.find({
      ...query,
      status: { $in: ['scheduled', 'active'] }
    }).populate('templateId patientId primaryPractitionerId');

    const upcomingSessions = [];
    programs.forEach(program => {
      const sessions = program.upcomingSessions.slice(0, limit);
      sessions.forEach(session => {
        upcomingSessions.push({
          ...session.toObject(),
          programId: program._id,
          programName: program.programName,
          patientName: program.patientId?.name,
          practitionerName: program.primaryPractitionerId?.name
        });
      });
    });

    return upcomingSessions
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
      .slice(0, limit);
  }
}

export default TherapySchedulingService;