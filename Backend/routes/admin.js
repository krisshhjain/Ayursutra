import express from 'express';
import {
  adminLogin,
  createAdmin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserSuspension,
  getAdminProfile
} from '../controllers/adminController.js';
import {
  getDashboardStats,
  getUserAnalytics,
  getActivityLogs,
  exportData
} from '../controllers/analyticsController.js';
import {
  authenticateAdmin,
  requirePermission,
  requireAdminLevel,
  requireSuperAdmin,
  logActivity,
  adminRateLimit
} from '../middleware/adminAuth.js';
import { validateAdminLogin, validateAdminCreate } from '../middleware/adminValidation.js';
import { Practitioner } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Public routes (no authentication required)
// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', validateAdminLogin, adminLogin);

// Protected routes (authentication required)
router.use(authenticateAdmin);
router.use(adminRateLimit());

// Profile routes
// @route   GET /api/admin/profile
// @desc    Get admin profile
// @access  Private (Admin)
router.get('/profile', getAdminProfile);

// Dashboard and Analytics routes
// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin with analytics permission)
router.get('/dashboard/stats', 
  requirePermission('canAccessAnalytics'),
  logActivity('VIEW_ANALYTICS', 'system'),
  getDashboardStats
);

// @route   GET /api/admin/analytics/users
// @desc    Get detailed user analytics
// @access  Private (Admin with analytics permission)
router.get('/analytics/users',
  requirePermission('canAccessAnalytics'),
  logActivity('VIEW_ANALYTICS', 'system'),
  getUserAnalytics
);

// @route   GET /api/admin/logs
// @desc    Get activity logs
// @access  Private (Admin with log viewing permission)
router.get('/logs',
  requirePermission('canViewSystemLogs'),
  getActivityLogs
);

// @route   POST /api/admin/export
// @desc    Export data
// @access  Private (Admin with analytics permission)
router.post('/export',
  requirePermission('canAccessAnalytics'),
  logActivity('EXPORT_DATA', 'system'),
  exportData
);

// User Management routes
// @route   GET /api/admin/users
// @desc    Get all users (patients and practitioners)
// @access  Private (Admin with user management permission)
router.get('/users',
  requirePermission('canManageUsers'),
  getAllUsers
);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin with user viewing permission)
router.get('/users/:id',
  requirePermission('canViewUserDetails'),
  getUserById
);

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin with user modification permission)
router.put('/users/:id',
  requirePermission('canModifyUserProfiles'),
  logActivity('UPDATE_USER', 'patient'), // Will be determined dynamically
  updateUser
);

// @route   DELETE /api/admin/users/:id
// @desc    Delete/Deactivate user
// @access  Private (Admin with user deletion permission)
router.delete('/users/:id',
  requirePermission('canDeleteUsers'),
  logActivity('DELETE_USER', 'patient'), // Will be determined dynamically
  deleteUser
);

// @route   POST /api/admin/users/:id/suspend
// @desc    Suspend or unsuspend user
// @access  Private (Admin with user management permission)
router.post('/users/:id/suspend',
  requirePermission('canManageUsers'),
  logActivity('SUSPEND_USER', 'patient'), // Will be determined dynamically
  toggleUserSuspension
);

// Practitioner-specific routes
// @route   POST /api/admin/practitioners
// @desc    Create new practitioner (Admin only)
// @access  Private (Admin with practitioner creation permission)
router.post('/practitioners',
  requirePermission('canManagePractitioners'),
  logActivity('CREATE_PRACTITIONER', 'practitioner'),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        dateOfBirth,
        gender,
        specializations,
        qualifications,
        experience,
        consultationFee,
        languagesSpoken,
        clinicAddress,
        bio,
        availableTimeSlots
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: firstName, lastName, email, phone, password'
        });
      }

      // Check if practitioner already exists
      const existingPractitioner = await Practitioner.findOne({ 
        $or: [{ email }, { mobile: phone }] 
      });

      if (existingPractitioner) {
        return res.status(400).json({
          success: false,
          message: 'Practitioner with this email or phone already exists'
        });
      }

      // Create practitioner (password will be hashed by the model's pre-save middleware)
      const practitioner = new Practitioner({
        firstName,
        lastName,
        email,
        mobile: phone,
        password: password, // Let the model's pre-save middleware hash this
        userType: 'practitioner',
        specialization: specializations && specializations.length > 0 ? specializations[0] : 'general',
        qualifications: qualifications || [],
        experience: experience || 0,
        consultationFee: consultationFee || 0,
        isVerified: false, // Will be verified by admin later
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await practitioner.save();

      // Remove password from response
      const practitionerResponse = practitioner.toObject();
      delete practitionerResponse.password;

      res.status(201).json({
        success: true,
        message: 'Practitioner created successfully',
        data: { practitioner: practitionerResponse }
      });

    } catch (error) {
      console.error('Create practitioner error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create practitioner',
        error: error.message
      });
    }
  }
);

// @route   GET /api/admin/practitioners
// @desc    Get all practitioners
// @access  Private (Admin with practitioner viewing permission)
router.get('/practitioners',
  requirePermission('canViewPractitioners'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        specialization,
        isVerified,
        isActive
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter = {};
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      if (specialization) filter.specialization = specialization;
      if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const [practitioners, totalCount] = await Promise.all([
        Practitioner.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Practitioner.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        success: true,
        message: 'Practitioners retrieved successfully',
        data: {
          practitioners,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalPractitioners: totalCount,
            practitionersPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve practitioners',
        error: error.message
      });
    }
  }
);

// @route   POST /api/admin/practitioners/:id/verify
// @desc    Verify practitioner
// @access  Private (Admin with practitioner verification permission)
router.post('/practitioners/:id/verify',
  requirePermission('canVerifyPractitioners'),
  logActivity('VERIFY_PRACTITIONER', 'practitioner'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { verified = true, notes } = req.body;
      
      const practitioner = await Practitioner.findByIdAndUpdate(
        id,
        { 
          isVerified: verified,
          ...(notes && { verificationNotes: notes }),
          updatedAt: Date.now()
        },
        { new: true }
      ).select('-password');

      if (!practitioner) {
        return res.status(404).json({
          success: false,
          message: 'Practitioner not found'
        });
      }

      res.status(200).json({
        success: true,
        message: `Practitioner ${verified ? 'verified' : 'unverified'} successfully`,
        data: { practitioner }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update practitioner verification',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/admin/practitioners/:id/rates
// @desc    Update practitioner consultation rates
// @access  Private (Admin with rate setting permission)
router.put('/practitioners/:id/rates',
  requirePermission('canSetPractitionerRates'),
  logActivity('UPDATE_PRACTITIONER', 'practitioner'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { consultationFee } = req.body;

      if (!consultationFee || consultationFee < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid consultation fee is required'
        });
      }
      
      const practitioner = await Practitioner.findByIdAndUpdate(
        id,
        { 
          consultationFee,
          updatedAt: Date.now()
        },
        { new: true }
      ).select('-password');

      if (!practitioner) {
        return res.status(404).json({
          success: false,
          message: 'Practitioner not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Consultation fee updated successfully',
        data: { practitioner }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update consultation fee',
        error: error.message
      });
    }
  }
);

// Admin Management routes (Super Admin only)
// @route   POST /api/admin/admins
// @desc    Create new admin
// @access  Private (Super Admin only)
router.post('/admins',
  requireSuperAdmin,
  validateAdminCreate,
  logActivity('CREATE_ADMIN', 'admin'),
  createAdmin
);

// @route   GET /api/admin/admins
// @desc    Get all admins
// @access  Private (Admin with admin management permission)
router.get('/admins',
  requirePermission('canManageAdmins'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        adminLevel,
        department,
        isActive
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter = {};
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } }
        ];
      }
      if (adminLevel) filter.adminLevel = adminLevel;
      if (department) filter.department = department;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const [admins, totalCount] = await Promise.all([
        Admin.find(filter)
          .select('-password -twoFactorSecret')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Admin.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        success: true,
        message: 'Admins retrieved successfully',
        data: {
          admins,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalAdmins: totalCount,
            adminsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve admins',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/admin/admins/:id
// @desc    Update admin
// @access  Private (Super Admin only)
router.put('/admins/:id',
  requireSuperAdmin,
  logActivity('UPDATE_ADMIN', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Prevent updating sensitive fields
      delete updateData.password;
      delete updateData._id;
      delete updateData.employeeId;
      delete updateData.createdAt;

      const admin = await Admin.findByIdAndUpdate(
        id,
        { ...updateData, updatedBy: req.admin._id, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).select('-password -twoFactorSecret');

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Admin updated successfully',
        data: { admin }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update admin',
        error: error.message
      });
    }
  }
);

// @route   DELETE /api/admin/admins/:id
// @desc    Delete admin
// @access  Private (Super Admin only)
router.delete('/admins/:id',
  requireSuperAdmin,
  logActivity('DELETE_ADMIN', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.admin._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const admin = await Admin.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: Date.now() },
        { new: true }
      ).select('-password -twoFactorSecret');

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Admin deactivated successfully',
        data: { admin }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete admin',
        error: error.message
      });
    }
  }
);

export default router;