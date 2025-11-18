import express from 'express';
import { Patient, Practitioner } from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { deleteOldProfileImage, getProfileImageUrl } from '../utils/fileUtils.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(authorize('patient'));

// @route   GET /api/patient/dashboard
// @desc    Get patient dashboard data
// @access  Private (Patient only)
router.get('/dashboard', async (req, res) => {
  try {
    const patientId = req.user._id;
    const patient = await Patient.findById(patientId);

    // Mock next therapy data (replace with actual appointment data)
    const therapies = ['Abhyanga', 'Shirodhara', 'Panchakarma', 'Rasayana'];
    const practitionersList = await Practitioner.find({ isActive: true, isVerified: true }).limit(5);
    
    const nextTherapy = {
      type: therapies[Math.floor(Math.random() * therapies.length)],
      date: 'Today',
      time: '2:00 PM',
      practitioner: practitionersList.length > 0 
        ? `Dr. ${practitionersList[0].firstName} ${practitionersList[0].lastName}`
        : 'Dr. Priya Sharma'
    };

    // Mock precautions (replace with therapy-specific precautions from database)
    const precautions = [
      "Drink warm water 30 minutes before therapy",
      "Avoid heavy meals 2 hours before session", 
      "Wear comfortable, loose clothing",
      "Keep yourself hydrated throughout the day"
    ];

    // Mock notifications (replace with actual notification system)
    const notifications = [
      { 
        title: "Therapy Reminder", 
        message: `${nextTherapy.type} therapy in 2 hours`, 
        time: "2 hours",
        type: "reminder"
      },
      { 
        title: "Precaution Update", 
        message: "New dietary guidelines available", 
        time: "1 day",
        type: "update"
      },
      { 
        title: "Progress Update", 
        message: "Weekly progress report ready", 
        time: "2 days",
        type: "progress"
      }
    ];

    // Mock statistics (replace with actual data from therapy sessions/progress models)
    const stats = {
      totalSessions: Math.floor(Math.random() * 20) + 5, // 5-25 sessions
      progressPercentage: Math.floor(Math.random() * 30) + 70, // 70-100%
      averageRating: (Math.random() * 1 + 4).toFixed(1), // 4.0-5.0
      daysRemaining: Math.floor(Math.random() * 30) + 10 // 10-40 days
    };

    // Mock detailed progress (replace with actual therapy progress tracking)
    const progressSummary = {
      overallRecovery: {
        percentage: stats.progressPercentage,
        status: stats.progressPercentage >= 90 ? 'Excellent' : stats.progressPercentage >= 70 ? 'Good' : 'Fair'
      },
      detoxPhase: {
        percentage: Math.min(100, stats.progressPercentage + 15),
        status: stats.progressPercentage >= 85 ? 'Complete' : 'In Progress'
      },
      rejuvenation: {
        percentage: Math.max(50, stats.progressPercentage - 15),
        status: stats.progressPercentage >= 90 ? 'Advanced' : 'Active'
      }
    };

    res.status(200).json({
      success: true,
      data: {
        patient: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          age: patient.age,
          email: patient.email,
          mobile: patient.mobile,
          gender: patient.gender,
          profileImage: patient.profileImage,
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          currentMedications: patient.currentMedications,
          emergencyContact: patient.emergencyContact
        },
        stats,
        progressSummary,
        nextTherapy,
        precautions,
        notifications
      }
    });

  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/patient/appointments
// @desc    Get patient's appointments
// @access  Private (Patient only)
router.get('/appointments', async (req, res) => {
  try {
    const patientId = req.user._id;
    const { upcoming = true } = req.query;

    // Mock appointments data (replace with actual appointments model)
    const practitionersList = await Practitioner.find({ isActive: true, isVerified: true }).limit(5);
    const therapies = ['Abhyanga', 'Shirodhara', 'Panchakarma', 'Rasayana', 'Consultation'];
    const statuses = ['confirmed', 'pending', 'completed'];

    const appointments = Array.from({ length: 8 }, (_, index) => {
      const date = new Date();
      if (upcoming === 'true') {
        date.setDate(date.getDate() + index);
      } else {
        date.setDate(date.getDate() - index);
      }

      const practitioner = practitionersList[index % practitionersList.length];
      const hour = 9 + (index % 8);
      
      return {
        id: index + 1,
        therapy: therapies[Math.floor(Math.random() * therapies.length)],
        practitioner: practitioner 
          ? `Dr. ${practitioner.firstName} ${practitioner.lastName}`
          : `Dr. ${['Priya Sharma', 'Raj Kumar', 'Meera Patel'][index % 3]}`,
        date: date.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
        duration: `${30 + Math.floor(Math.random() * 60)} min`,
        status: upcoming === 'true' ? 'confirmed' : statuses[Math.floor(Math.random() * statuses.length)],
        room: `Room ${(index % 3) + 1}`,
        notes: `Session notes for appointment ${index + 1}`
      };
    });

    res.status(200).json({
      success: true,
      data: {
        appointments: appointments.slice(0, 6) // Limit to 6 appointments
      }
    });

  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments data',
      error: error.message
    });
  }
});

// @route   GET /api/patient/progress
// @desc    Get patient's therapy progress
// @access  Private (Patient only)
router.get('/progress', async (req, res) => {
  try {
    const patientId = req.user._id;

    // Mock progress data (replace with actual therapy progress tracking)
    const progressData = {
      currentTherapy: {
        name: 'Abhyanga',
        startDate: '2024-01-01',
        endDate: '2024-02-15',
        progress: 65,
        sessionsCompleted: 13,
        totalSessions: 20
      },
      overallWellness: {
        physical: 78,
        mental: 85,
        emotional: 72,
        spiritual: 80
      },
      recentSessions: [
        {
          date: '2024-01-18',
          therapy: 'Abhyanga',
          duration: '60 min',
          notes: 'Good progress, continue current routine',
          rating: 4.5
        },
        {
          date: '2024-01-16',
          therapy: 'Abhyanga', 
          duration: '60 min',
          notes: 'Improved flexibility noticed',
          rating: 4.8
        }
      ],
      nextMilestone: {
        description: 'Complete 15 sessions',
        progress: 86,
        estimatedDate: '2024-01-25'
      }
    };

    res.status(200).json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Get patient progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress data',
      error: error.message
    });
  }
});

// @route   POST /api/patient/profile/image
// @desc    Upload or update patient profile image
// @access  Private (Patient only)
router.post('/profile/image', upload.single('profileImage'), async (req, res) => {
  try {
    const patientId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Get the patient and delete old image if exists
    const patient = await Patient.findById(patientId);
    if (patient.profileImage) {
      await deleteOldProfileImage(patient.profileImage);
    }

    // Save the new image filename
    const imageUrl = getProfileImageUrl(req.file.filename, req);
    patient.profileImage = req.file.filename;
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: imageUrl
      }
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
});

// @route   GET /api/patient/profile/image
// @desc    Get patient profile image URL
// @access  Private (Patient only)
router.get('/profile/image', async (req, res) => {
  try {
    const patientId = req.user._id;
    const patient = await Patient.findById(patientId).select('profileImage');

    if (!patient.profileImage) {
      return res.status(404).json({
        success: false,
        message: 'No profile image found'
      });
    }

    const imageUrl = getProfileImageUrl(patient.profileImage, req);

    res.status(200).json({
      success: true,
      data: {
        profileImage: imageUrl
      }
    });

  } catch (error) {
    console.error('Get profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile image',
      error: error.message
    });
  }
});

// @route   DELETE /api/patient/profile/image
// @desc    Delete patient profile image
// @access  Private (Patient only)
router.delete('/profile/image', async (req, res) => {
  try {
    const patientId = req.user._id;
    const patient = await Patient.findById(patientId);

    if (!patient.profileImage) {
      return res.status(404).json({
        success: false,
        message: 'No profile image to delete'
      });
    }

    // Delete the image file
    await deleteOldProfileImage(patient.profileImage);

    // Remove from database
    patient.profileImage = null;
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile image',
      error: error.message
    });
  }
});

export default router;