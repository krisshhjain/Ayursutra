import { validationResult } from 'express-validator';
import { Admin, ActivityLog } from '../models/Admin.js';
import { Patient, Practitioner } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import mongoose from 'mongoose';

// Admin Authentication Controllers
export const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (admin.isSuspended) {
      return res.status(401).json({
        success: false,
        message: `Account is suspended. Reason: ${admin.suspensionReason || 'Administrative action'}`
      });
    }

    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      // Log failed login attempt
      admin.loginHistory.push({
        loginTime: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false
      });
      await admin.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login and add to history
    admin.lastLogin = new Date();
    admin.loginHistory.push({
      loginTime: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    // Keep only last 10 login history entries
    if (admin.loginHistory.length > 10) {
      admin.loginHistory = admin.loginHistory.slice(-10);
    }

    await admin.save();

    // Generate JWT token
    const token = generateToken(admin._id, 'admin');

    // Log login activity
    const loginLog = new ActivityLog({
      adminId: admin._id,
      action: 'LOGIN',
      targetType: 'system',
      description: 'Admin logged in',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    await loginLog.save();

    // Prepare response
    const adminResponse = {
      _id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      mobile: admin.mobile,
      userType: admin.userType,
      adminLevel: admin.adminLevel,
      department: admin.department,
      permissions: admin.permissions,
      employeeId: admin.employeeId,
      profileImage: admin.profileImage,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: adminResponse,
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Create new admin (Super admin only)
export const createAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, employeeId, adminLevel, department } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists with this email or employee ID'
      });
    }

    // Get default permissions based on level and department
    const defaultPermissions = Admin.getDefaultPermissions(adminLevel, department);

    const newAdmin = new Admin({
      ...req.body,
      permissions: { ...defaultPermissions, ...req.body.permissions },
      createdBy: req.admin._id
    });

    await newAdmin.save();

    const adminResponse = {
      _id: newAdmin._id,
      firstName: newAdmin.firstName,
      lastName: newAdmin.lastName,
      email: newAdmin.email,
      mobile: newAdmin.mobile,
      adminLevel: newAdmin.adminLevel,
      department: newAdmin.department,
      employeeId: newAdmin.employeeId,
      permissions: newAdmin.permissions,
      isActive: newAdmin.isActive,
      createdAt: newAdmin.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin: adminResponse
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
};

// Get all users (patients and practitioners) with pagination and filters
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userType,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};
    if (userType && ['patient', 'practitioner'].includes(userType)) {
      // We'll search in the appropriate collection
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Build search criteria
    let searchCriteria = {};
    if (search) {
      searchCriteria = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const finalFilter = { ...filter, ...searchCriteria };
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let users = [];
    let totalCount = 0;

    if (!userType || userType === 'patient') {
      const patients = await Patient.find(finalFilter)
        .select('-password')
        .sort(sortOptions)
        .skip(userType === 'patient' ? skip : 0)
        .limit(userType === 'patient' ? limitNum : limitNum / 2);
      
      const patientCount = await Patient.countDocuments(finalFilter);
      users.push(...patients.map(p => ({ ...p.toObject(), userType: 'patient' })));
      totalCount += patientCount;
    }

    if (!userType || userType === 'practitioner') {
      const practitioners = await Practitioner.find(finalFilter)
        .select('-password')
        .sort(sortOptions)
        .skip(userType === 'practitioner' ? skip : (userType ? 0 : skip))
        .limit(userType === 'practitioner' ? limitNum : limitNum / 2);
      
      const practitionerCount = await Practitioner.countDocuments(finalFilter);
      users.push(...practitioners.map(p => ({ ...p.toObject(), userType: 'practitioner' })));
      totalCount += practitionerCount;
    }

    // Sort combined results if not filtering by userType
    if (!userType) {
      users.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        const order = sortOrder === 'desc' ? -1 : 1;
        return aValue > bValue ? order : aValue < bValue ? -order : 0;
      });
      
      // Apply pagination to combined results
      users = users.slice(skip, skip + limitNum);
    }

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers: totalCount,
          usersPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    let user = null;

    if (userType === 'patient') {
      user = await Patient.findById(id).select('-password');
    } else if (userType === 'practitioner') {
      user = await Practitioner.findById(id).select('-password');
    } else {
      // Try both collections
      user = await Patient.findById(id).select('-password');
      if (!user) {
        user = await Practitioner.findById(id).select('-password');
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: { ...user.toObject(), userType: user.userType }
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.query;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData._id;
    delete updateData.createdAt;
    
    let user = null;
    let Model = null;

    if (userType === 'patient') {
      Model = Patient;
    } else if (userType === 'practitioner') {
      Model = Practitioner;
    } else {
      // Determine model by finding the user first
      user = await Patient.findById(id);
      if (user) {
        Model = Patient;
      } else {
        user = await Practitioner.findById(id);
        if (user) {
          Model = Practitioner;
        }
      }
    }

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await Model.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.query;
    const { permanent = false } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    let user = null;
    let Model = null;

    if (userType === 'patient') {
      Model = Patient;
    } else if (userType === 'practitioner') {
      Model = Practitioner;
    } else {
      user = await Patient.findById(id);
      if (user) {
        Model = Patient;
      } else {
        user = await Practitioner.findById(id);
        if (user) {
          Model = Practitioner;
        }
      }
    }

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (permanent === 'true') {
      // Permanent deletion (requires special permission)
      await Model.findByIdAndDelete(id);
      
      res.status(200).json({
        success: true,
        message: 'User permanently deleted'
      });
    } else {
      // Soft delete - just deactivate
      const updatedUser = await Model.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: Date.now() },
        { new: true }
      ).select('-password');

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: {
          user: updatedUser
        }
      });
    }

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Suspend/Unsuspend user
export const toggleUserSuspension = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.query;
    const { reason, suspend = true } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    let Model = null;
    if (userType === 'patient') {
      Model = Patient;
    } else if (userType === 'practitioner') {
      Model = Practitioner;
    } else {
      return res.status(400).json({
        success: false,
        message: 'User type must be specified'
      });
    }

    const updateData = {
      isActive: !suspend,
      updatedAt: Date.now()
    };

    if (suspend && reason) {
      updateData.suspensionReason = reason;
    } else if (!suspend) {
      updateData.$unset = { suspensionReason: 1 };
    }

    const user = await Model.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Toggle user suspension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user suspension status',
      error: error.message
    });
  }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin;
    
    const adminResponse = {
      _id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      mobile: admin.mobile,
      userType: admin.userType,
      adminLevel: admin.adminLevel,
      department: admin.department,
      permissions: admin.permissions,
      employeeId: admin.employeeId,
      profileImage: admin.profileImage,
      joiningDate: admin.joiningDate,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive,
      loginHistory: admin.loginHistory.slice(-5), // Last 5 logins
      createdAt: admin.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        admin: adminResponse
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin profile',
      error: error.message
    });
  }
};