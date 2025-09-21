import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { generateSlots, validateSlotAvailability, getNextAvailableSlots } from '../lib/slotGenerator.js';
import PractitionerAvailability from '../models/PractitionerAvailability.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ayursutra-test';

describe('Slot Generator Utility', () => {
  let practitionerId;
  let practitionerAvailability;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
    
    // Clean up existing test data
    await User.deleteMany({ email: /@test\.com$/ });
    await Appointment.deleteMany({});
    await PractitionerAvailability.deleteMany({});

    // Create test practitioner
    const practitioner = new User({
      firstName: 'Dr. Test',
      lastName: 'Practitioner',
      email: 'slot-test@test.com',
      password: 'password123',
      userType: 'practitioner',
      specialization: 'Panchakarma',
      isVerified: true
    });
    await practitioner.save();
    practitionerId = practitioner._id;

    // Create availability
    practitionerAvailability = new PractitionerAvailability({
      practitionerId,
      slotLength: 30,
      bufferBefore: 10,
      bufferAfter: 10,
      timezone: 'Asia/Kolkata',
      weeklyHours: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isWorking: true },
        { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isWorking: true },
        { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isWorking: false }
      ],
      exceptions: []
    });
    await practitionerAvailability.save();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test\.com$/ });
    await Appointment.deleteMany({});
    await PractitionerAvailability.deleteMany({});
    await mongoose.connection.close();
  });

  describe('generateSlots function', () => {
    test('should generate slots for working weekday', async () => {
      // Find next Monday
      const nextMonday = new Date('2025-09-22'); // Known Monday
      const dateStr = nextMonday.toISOString().split('T')[0];
      
      const slots = await generateSlots(practitionerId, dateStr);
      
      expect(slots).toBeDefined();
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
      
      // Check first slot structure
      const firstSlot = slots[0];
      expect(firstSlot).toHaveProperty('startTime');
      expect(firstSlot).toHaveProperty('endTime');
      expect(firstSlot).toHaveProperty('isAvailable');
      expect(typeof firstSlot.isAvailable).toBe('boolean');
    });

    test('should return empty array for non-working day', async () => {
      // Use Sunday (non-working day)
      const sunday = new Date('2025-09-21'); // Known Sunday
      const dateStr = sunday.toISOString().split('T')[0];
      
      const slots = await generateSlots(practitionerId, dateStr);
      
      expect(slots).toEqual([]);
    });

    test('should handle shorter Saturday hours', async () => {
      // Find next Saturday
      const nextSaturday = new Date('2025-09-27'); // Known Saturday
      const dateStr = nextSaturday.toISOString().split('T')[0];
      
      const slots = await generateSlots(practitionerId, dateStr);
      
      expect(slots).toBeDefined();
      expect(Array.isArray(slots)).toBe(true);
      
      if (slots.length > 0) {
        // Should have fewer slots than weekdays (4 hours vs 8 hours)
        expect(slots.length).toBeLessThan(16); // Less than full day
        expect(slots.length).toBeGreaterThan(0); // But still some slots
      }
    });
  });

  describe('validateSlotAvailability function', () => {
    test('should validate available slot', async () => {
      const monday = new Date('2025-09-22');
      const dateStr = monday.toISOString().split('T')[0];
      const slotStart = new Date(`${dateStr}T09:00:00.000Z`);
      const slotEnd = new Date(`${dateStr}T09:30:00.000Z`);
      
      const validation = await validateSlotAvailability(
        practitionerId,
        dateStr,
        slotStart,
        slotEnd
      );
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('reason');
      expect(validation.isValid).toBe(true);
    });

    test('should reject slot outside working hours', async () => {
      const monday = new Date('2025-09-22');
      const dateStr = monday.toISOString().split('T')[0];
      const slotStart = new Date(`${dateStr}T06:00:00.000Z`); // Before 9 AM
      const slotEnd = new Date(`${dateStr}T06:30:00.000Z`);
      
      const validation = await validateSlotAvailability(
        practitionerId,
        dateStr,
        slotStart,
        slotEnd
      );
      
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('outside working hours');
    });

    test('should reject slot on non-working day', async () => {
      const sunday = new Date('2025-09-21');
      const dateStr = sunday.toISOString().split('T')[0];
      const slotStart = new Date(`${dateStr}T10:00:00.000Z`);
      const slotEnd = new Date(`${dateStr}T10:30:00.000Z`);
      
      const validation = await validateSlotAvailability(
        practitionerId,
        dateStr,
        slotStart,
        slotEnd
      );
      
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('not working');
    });
  });

  describe('getNextAvailableSlots function', () => {
    test('should return next available slots', async () => {
      const monday = new Date('2025-09-22');
      const dateStr = monday.toISOString().split('T')[0];
      
      const nextSlots = await getNextAvailableSlots(practitionerId, dateStr, 3);
      
      expect(nextSlots).toBeDefined();
      expect(Array.isArray(nextSlots)).toBe(true);
      expect(nextSlots.length).toBeLessThanOrEqual(3);
      
      if (nextSlots.length > 0) {
        const firstSlot = nextSlots[0];
        expect(firstSlot).toHaveProperty('startTime');
        expect(firstSlot).toHaveProperty('endTime');
        expect(firstSlot).toHaveProperty('date');
      }
    });

    test('should limit results to requested count', async () => {
      const monday = new Date('2025-09-22');
      const dateStr = monday.toISOString().split('T')[0];
      
      const nextSlots = await getNextAvailableSlots(practitionerId, dateStr, 2);
      
      expect(nextSlots.length).toBeLessThanOrEqual(2);
    });
  });

  describe('edge cases', () => {
    test('should handle invalid practitioner ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const monday = new Date('2025-09-22');
      const dateStr = monday.toISOString().split('T')[0];
      
      const slots = await generateSlots(invalidId, dateStr);
      
      expect(slots).toEqual([]);
    });

    test('should handle invalid date format', async () => {
      const slots = await generateSlots(practitionerId, 'invalid-date');
      
      expect(slots).toEqual([]);
    });

    test('should handle buffer time correctly', async () => {
      // Create an appointment to test buffer
      const monday = new Date('2025-09-22');
      const dateStr = monday.toISOString().split('T')[0];
      
      const existingAppointment = new Appointment({
        practitionerId,
        patientId: practitionerId, // Use same ID for testing
        date: dateStr,
        slotStartUtc: new Date(`${dateStr}T10:00:00.000Z`),
        slotEndUtc: new Date(`${dateStr}T10:30:00.000Z`),
        duration: 30,
        status: 'confirmed',
        notes: 'Test appointment'
      });
      await existingAppointment.save();
      
      // Check that slots around this time consider buffer
      const beforeSlotStart = new Date(`${dateStr}T09:45:00.000Z`); // 15 min before (should conflict with 10min buffer)
      const beforeSlotEnd = new Date(`${dateStr}T10:15:00.000Z`);
      
      const validation = await validateSlotAvailability(
        practitionerId,
        dateStr,
        beforeSlotStart,
        beforeSlotEnd
      );
      
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('conflicts');
      
      // Clean up
      await Appointment.findByIdAndDelete(existingAppointment._id);
    });
  });
});