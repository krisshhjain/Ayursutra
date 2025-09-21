import express from 'express';
import { Practitioner, Patient } from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(authorize('practitioner'));

// @route   GET /api/practitioner/dashboard
// @desc    Get practitioner dashboard statistics
// @access  Private (Practitioner only)
router.get('/dashboard', async (req, res) => {
  try {
    const practitionerId = req.user._id;

    // Get active patients count (mock for now - replace with actual appointments/patients data)
    const activePatients = await Patient.countDocuments({ isActive: true });
    
    // Mock today's sessions (replace with actual appointment queries when appointments model exists)
    const todaySessions = Math.floor(Math.random() * 15) + 5;
    
    // Get practitioner data and real rating from reviews
    const practitioner = await Practitioner.findById(practitionerId);
    
    // Get real average rating from reviews
    let avgRating = 0;
    try {
      const Review = (await import('../models/Review.js')).default;
      const reviewStats = await Review.getPractitionerStats(practitionerId);
      avgRating = reviewStats.averageRating || 0;
    } catch (reviewError) {
      console.log('No reviews yet for practitioner:', practitionerId);
      avgRating = practitioner.rating || 0;
    }
    
    // Mock success rate (replace with actual calculation based on completed treatments)
    const successRate = Math.floor(Math.random() * 20) + 80;

    res.status(200).json({
      success: true,
      data: {
        practitioner: {
          firstName: practitioner.firstName,
          lastName: practitioner.lastName,
          specialization: practitioner.specialization || 'Ayurvedic Practitioner',
          experience: practitioner.experience || 5,
          qualification: practitioner.qualification || 'BAMS'
        },
        stats: {
          activePatients,
          todaySessions,
          avgRating,
          successRate
        }
      }
    });

  } catch (error) {
    console.error('Get practitioner dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/practitioner/patients
// @desc    Get practitioner's patients list
// @access  Private (Practitioner only)
router.get('/patients', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      therapy
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    // Get patients (for now, all patients - later this should be filtered by practitioner assignments)
    const [patients, totalCount] = await Promise.all([
      Patient.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Patient.countDocuments(filter)
    ]);

    // Transform patients data to include mock therapy info (replace with actual therapy/appointment data)
    const transformedPatients = patients.map(patient => {
      const therapies = ['Abhyanga', 'Shirodhara', 'Panchakarma', 'Rasayana', 'Consultation'];
      const statuses = ['active', 'consultation', 'completed'];
      
      return {
        id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        age: patient.age,
        phone: patient.mobile,
        email: patient.email,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        therapy: therapies[Math.floor(Math.random() * therapies.length)],
        progress: Math.floor(Math.random() * 100),
        lastVisit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextAppointment: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        avatar: `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`
      };
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        patients: transformedPatients,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPatients: totalCount,
          patientsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get practitioner patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patients data',
      error: error.message
    });
  }
});

// @route   GET /api/practitioner/schedule
// @desc    Get practitioner's schedule/appointments
// @access  Private (Practitioner only)
router.get('/schedule', async (req, res) => {
  try {
    const { date } = req.query;
    const practitionerId = req.user._id;

    // Mock appointments data (replace with actual appointments model queries)
    const patients = await Patient.find({ isActive: true }).limit(10);
    
    const therapies = ['Abhyanga', 'Shirodhara', 'Panchakarma', 'Rasayana', 'Consultation'];
    const statuses = ['confirmed', 'pending', 'completed', 'cancelled'];
    const rooms = ['Room 1', 'Room 2', 'Room 3', 'Consultation Room'];
    
    const appointments = patients.map((patient, index) => {
      const hour = 9 + index;
      return {
        id: index + 1,
        patient: `${patient.firstName} ${patient.lastName}`,
        therapy: therapies[Math.floor(Math.random() * therapies.length)],
        date: date || new Date().toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
        duration: `${30 + Math.floor(Math.random() * 60)} min`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        room: rooms[Math.floor(Math.random() * rooms.length)],
        notes: `Session notes for ${patient.firstName}`,
        patientId: patient._id
      };
    });

    res.status(200).json({
      success: true,
      data: {
        appointments,
        date: date || new Date().toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Get practitioner schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schedule data',
      error: error.message
    });
  }
});

// @route   GET /api/practitioner/appointments
// @desc    Get practitioner's appointments with optional status filter
// @access  Private (Practitioner only)
router.get('/appointments', async (req, res) => {
  try {
    const { status } = req.query;
    const practitionerId = req.user._id;

    // If specifically requesting confirmed appointments
    if (status === 'confirmed') {
      // For now, return mock confirmed appointments until real appointment system is implemented
      const patients = await Patient.find({ isActive: true }).limit(15);
      
      const therapies = ['Abhyanga', 'Shirodhara', 'Panchakarma', 'Rasayana', 'Consultation'];
      const rooms = ['Room 1', 'Room 2', 'Room 3', 'Consultation Room'];
      
      const confirmedAppointments = patients.slice(0, 8).map((patient, index) => {
        // Create appointments for different dates (past, today, future)
        const baseDate = new Date();
        let appointmentDate;
        
        if (index < 2) {
          // Past appointments
          appointmentDate = new Date(baseDate.getTime() - (index + 1) * 24 * 60 * 60 * 1000);
        } else if (index < 4) {
          // Today's appointments
          appointmentDate = new Date(baseDate);
        } else {
          // Future appointments
          appointmentDate = new Date(baseDate.getTime() + (index - 3) * 24 * 60 * 60 * 1000);
        }
        
        const hour = 9 + (index % 10);
        return {
          id: `confirmed-${index + 1}`,
          patient: `${patient.firstName} ${patient.lastName}`,
          therapy: therapies[Math.floor(Math.random() * therapies.length)],
          date: appointmentDate.toISOString().split('T')[0],
          time: `${hour.toString().padStart(2, '0')}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
          duration: `${30 + Math.floor(Math.random() * 60)} min`,
          status: 'confirmed',
          room: rooms[Math.floor(Math.random() * rooms.length)],
          notes: `Session notes for ${patient.firstName}`,
          patientId: patient._id,
          location: 'Clinic'
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          appointments: confirmedAppointments
        }
      });
    }

    // Default behavior for other status filters (can be expanded later)
    res.status(200).json({
      success: true,
      data: {
        appointments: []
      }
    });

  } catch (error) {
    console.error('Get practitioner appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments data',
      error: error.message
    });
  }
});

export default router;