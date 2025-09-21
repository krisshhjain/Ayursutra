import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import PractitionerAvailability from '../models/PractitionerAvailability.js';
import { generateSlots, validateSlotAvailability, getNextAvailableSlots } from '../lib/slotGenerator.js';

// Test database connection
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ayursutra-test';

describe('Appointment Booking System', () => {
  let practitioner, patient, practitionerToken, patientToken;
  let practitionerAvailability;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Clean up existing test data
    await User.deleteMany({ email: /@test\.com$/ });
    await Appointment.deleteMany({});
    await PractitionerAvailability.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({ email: /@test\.com$/ });
    await Appointment.deleteMany({});
    await PractitionerAvailability.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test users
    practitioner = new User({
      firstName: 'Dr. Test',
      lastName: 'Practitioner',
      email: 'practitioner@test.com',
      password: 'password123',
      userType: 'practitioner',
      specialization: 'Panchakarma',
      isVerified: true
    });
    await practitioner.save();

    patient = new User({
      firstName: 'Test',
      lastName: 'Patient',
      email: 'patient@test.com',
      password: 'password123',
      userType: 'patient',
      isVerified: true
    });
    await patient.save();

    // Get auth tokens
    const practitionerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'practitioner@test.com',
        password: 'password123'
      });
    practitionerToken = practitionerLogin.body.token;

    const patientLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'patient@test.com',
        password: 'password123'
      });
    patientToken = patientLogin.body.token;

    // Create practitioner availability
    practitionerAvailability = new PractitionerAvailability({
      practitionerId: practitioner._id,
      slotLength: 30,
      bufferBefore: 10,
      bufferAfter: 10,
      timezone: 'Asia/Kolkata',
      weeklyHours: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isWorking: true }, // Monday
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isWorking: true }, // Tuesday
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isWorking: true }, // Wednesday
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isWorking: true }, // Thursday
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isWorking: true }, // Friday
        { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isWorking: true }, // Saturday
        { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isWorking: false } // Sunday
      ],
      exceptions: []
    });
    await practitionerAvailability.save();
  });

  describe('Slot Generation', () => {
    test('should generate slots for a working day', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Ensure it's a weekday (Monday = 1)
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      
      const dateStr = tomorrow.toISOString().split('T')[0];
      const slots = await generateSlots(practitioner._id, dateStr);
      
      expect(slots).toBeDefined();
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
      
      // Check slot structure
      const firstSlot = slots[0];
      expect(firstSlot).toHaveProperty('startTime');
      expect(firstSlot).toHaveProperty('endTime');
      expect(firstSlot).toHaveProperty('isAvailable');
    });

    test('should not generate slots for non-working day', async () => {
      // Find next Sunday
      const nextSunday = new Date();
      while (nextSunday.getDay() !== 0) {
        nextSunday.setDate(nextSunday.getDate() + 1);
      }
      
      const dateStr = nextSunday.toISOString().split('T')[0];
      const slots = await generateSlots(practitioner._id, dateStr);
      
      expect(slots).toEqual([]);
    });

    test('should validate slot availability correctly', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      
      const dateStr = tomorrow.toISOString().split('T')[0];
      const slotStart = new Date(`${dateStr}T09:00:00.000Z`);
      const slotEnd = new Date(`${dateStr}T09:30:00.000Z`);
      
      const validation = await validateSlotAvailability(
        practitioner._id,
        dateStr,
        slotStart,
        slotEnd
      );
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('reason');
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Appointment Booking API', () => {
    test('should get available slots for practitioner', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/appointments/availability/${practitioner._id}`)
        .query({ date: dateStr })
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('slots');
      expect(Array.isArray(response.body.data.slots)).toBe(true);
    });

    test('should create appointment request', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const dateStr = tomorrow.toISOString().split('T')[0];
      const slotStartUtc = new Date(`${dateStr}T09:00:00.000Z`);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          practitionerId: practitioner._id,
          date: dateStr,
          slotStartUtc: slotStartUtc.toISOString(),
          duration: 30,
          notes: 'Test consultation'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.status).toBe('requested');
      expect(response.body.data.patientId).toBe(patient._id.toString());
    });

    test('should prevent double booking', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const dateStr = tomorrow.toISOString().split('T')[0];
      const slotStartUtc = new Date(`${dateStr}T10:00:00.000Z`);

      // Create first appointment
      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          practitionerId: practitioner._id,
          date: dateStr,
          slotStartUtc: slotStartUtc.toISOString(),
          duration: 30,
          notes: 'First appointment'
        });

      // Try to create second appointment at same time
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          practitionerId: practitioner._id,
          date: dateStr,
          slotStartUtc: slotStartUtc.toISOString(),
          duration: 30,
          notes: 'Second appointment'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('slot is not available');
    });

    test('should confirm appointment (practitioner only)', async () => {
      // Create appointment first
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const dateStr = tomorrow.toISOString().split('T')[0];
      const slotStartUtc = new Date(`${dateStr}T11:00:00.000Z`);

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          practitionerId: practitioner._id,
          date: dateStr,
          slotStartUtc: slotStartUtc.toISOString(),
          duration: 30,
          notes: 'Confirmation test'
        });

      const appointmentId = createResponse.body.data._id;

      // Confirm appointment
      const confirmResponse = await request(app)
        .post(`/api/appointments/${appointmentId}/confirm`)
        .set('Authorization', `Bearer ${practitionerToken}`);

      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.body.success).toBe(true);
      expect(confirmResponse.body.data.appointment.status).toBe('confirmed');
    });

    test('should cancel appointment', async () => {
      // Create appointment first
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const dateStr = tomorrow.toISOString().split('T')[0];
      const slotStartUtc = new Date(`${dateStr}T12:00:00.000Z`);

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          practitionerId: practitioner._id,
          date: dateStr,
          slotStartUtc: slotStartUtc.toISOString(),
          duration: 30,
          notes: 'Cancellation test'
        });

      const appointmentId = createResponse.body.data._id;

      // Cancel appointment
      const cancelResponse = await request(app)
        .patch(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          action: 'cancel',
          reason: 'Change of plans'
        });

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.data.status).toBe('cancelled');
    });

    test('should list patient appointments', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('appointments');
      expect(Array.isArray(response.body.data.appointments)).toBe(true);
    });
  });

  describe('Authorization', () => {
    test('should require authentication for booking', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          practitionerId: practitioner._id,
          date: '2024-01-15',
          slotStartUtc: '2024-01-15T09:00:00.000Z',
          duration: 30
        });

      expect(response.status).toBe(401);
    });

    test('should prevent unauthorized appointment confirmation', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const dateStr = tomorrow.toISOString().split('T')[0];
      const slotStartUtc = new Date(`${dateStr}T13:00:00.000Z`);

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          practitionerId: practitioner._id,
          date: dateStr,
          slotStartUtc: slotStartUtc.toISOString(),
          duration: 30,
          notes: 'Auth test'
        });

      const appointmentId = createResponse.body.data._id;

      // Try to confirm with patient token (should fail)
      const confirmResponse = await request(app)
        .post(`/api/appointments/${appointmentId}/confirm`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(confirmResponse.status).toBe(403);
    });
  });

  describe('Concurrency Testing', () => {
    test('should handle concurrent booking attempts', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const dateStr = tomorrow.toISOString().split('T')[0];
      const slotStartUtc = new Date(`${dateStr}T14:00:00.000Z`);

      // Create another patient for concurrent test
      const patient2 = new User({
        firstName: 'Test2',
        lastName: 'Patient2',
        email: 'patient2@test.com',
        password: 'password123',
        userType: 'patient',
        isVerified: true
      });
      await patient2.save();

      const patient2Login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'patient2@test.com',
          password: 'password123'
        });
      const patient2Token = patient2Login.body.token;

      // Attempt concurrent bookings for same slot
      const bookingData = {
        practitionerId: practitioner._id,
        date: dateStr,
        slotStartUtc: slotStartUtc.toISOString(),
        duration: 30,
        notes: 'Concurrent test'
      };

      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/appointments')
          .set('Authorization', `Bearer ${patientToken}`)
          .send(bookingData),
        request(app)
          .post('/api/appointments')
          .set('Authorization', `Bearer ${patient2Token}`)
          .send(bookingData)
      ]);

      // One should succeed, one should fail
      const responses = [response1, response2];
      const successCount = responses.filter(r => r.status === 201).length;
      const conflictCount = responses.filter(r => r.status === 409).length;

      expect(successCount).toBe(1);
      expect(conflictCount).toBe(1);

      // Clean up
      await User.findByIdAndDelete(patient2._id);
    });
  });
});