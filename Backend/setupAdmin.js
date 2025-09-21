import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from './models/Admin.js';
import connectDB from './config/database.js';

dotenv.config();

// Initial super admin setup
const setupSuperAdmin = async () => {
  try {
    await connectDB();

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ adminLevel: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new Admin({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@ayursutra.com',
      mobile: '9999999999',
      password: 'SuperAdmin123!',
      adminLevel: 'super_admin',
      department: 'operations',
      employeeId: 'SA001',
      permissions: {
        canManageUsers: true,
        canDeleteUsers: true,
        canViewUserDetails: true,
        canModifyUserProfiles: true,
        canManagePractitioners: true,
        canVerifyPractitioners: true,
        canSetPractitionerRates: true,
        canAccessAnalytics: true,
        canManageSystemSettings: true,
        canViewSystemLogs: true,
        canManageAdmins: true,
        canManageContent: true,
        canManageNotifications: true,
        canManageReports: true,
        canViewFinancials: true,
        canManagePayments: true
      }
    });

    await superAdmin.save();

    console.log('🎉 Super admin created successfully!');
    console.log('📧 Email: superadmin@ayursutra.com');
    console.log('🔑 Password: SuperAdmin123!');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    process.exit(1);
  }
};

// Run the setup
setupSuperAdmin();