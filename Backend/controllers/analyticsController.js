import { Patient, Practitioner } from '../models/User.js';
import { Admin, ActivityLog, SystemNotification } from '../models/Admin.js';
import mongoose from 'mongoose';

// Dashboard overview statistics
export const getDashboardStats = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Parallel queries for better performance
    const [
      totalPatients,
      totalPractitioners,
      totalAdmins,
      activePatients,
      activePractitioners,
      newPatientsInRange,
      newPractitionersInRange,
      verifiedPractitioners,
      recentActivity
    ] = await Promise.all([
      Patient.countDocuments(),
      Practitioner.countDocuments(),
      Admin.countDocuments(),
      Patient.countDocuments({ isActive: true }),
      Practitioner.countDocuments({ isActive: true }),
      Patient.countDocuments({ createdAt: { $gte: startDate } }),
      Practitioner.countDocuments({ createdAt: { $gte: startDate } }),
      Practitioner.countDocuments({ isVerified: true }),
      ActivityLog.find().sort({ timestamp: -1 }).limit(10)
        .populate('adminId', 'firstName lastName email')
    ]);

    // User growth over time
    const userGrowthData = await getUserGrowthData(startDate, timeRange);
    
    // Practitioner specialization breakdown
    const specializationStats = await Practitioner.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
          verified: {
            $sum: {
              $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Geographic distribution (if location data available)
    const geographicStats = await getGeographicDistribution();

    // System health metrics
    const systemHealth = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      activeConnections: 0, // You can implement this based on your needs
      errorRate: await getErrorRate(startDate)
    };

    const stats = {
      overview: {
        totalUsers: totalPatients + totalPractitioners,
        totalPatients,
        totalPractitioners,
        totalAdmins,
        activeUsers: activePatients + activePractitioners,
        activePatients,
        activePractitioners,
        verifiedPractitioners,
        verificationRate: totalPractitioners > 0 ? (verifiedPractitioners / totalPractitioners * 100).toFixed(1) : 0
      },
      growth: {
        newUsersInRange: newPatientsInRange + newPractitionersInRange,
        newPatientsInRange,
        newPractitionersInRange,
        growthRate: calculateGrowthRate(totalPatients + totalPractitioners, newPatientsInRange + newPractitionersInRange, timeRange)
      },
      charts: {
        userGrowth: userGrowthData,
        specializations: specializationStats,
        geographic: geographicStats
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        action: activity.action,
        description: activity.description,
        admin: activity.adminId ? `${activity.adminId.firstName} ${activity.adminId.lastName}` : 'System',
        timestamp: activity.timestamp,
        targetType: activity.targetType
      })),
      systemHealth,
      timeRange
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
};

// Get detailed user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const { 
      startDate,
      endDate,
      userType,
      groupBy = 'day' // day, week, month
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Date grouping based on groupBy parameter
    let dateGroupFormat;
    switch (groupBy) {
      case 'week':
        dateGroupFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateGroupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // day
        dateGroupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const matchStage = {
      createdAt: { $gte: start, $lte: end }
    };

    let analytics = {};

    if (!userType || userType === 'patient') {
      const patientAnalytics = await Patient.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: dateGroupFormat,
            count: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0]
              }
            },
            ageGroups: {
              $push: {
                $switch: {
                  branches: [
                    { case: { $lt: ['$age', 18] }, then: 'under_18' },
                    { case: { $lt: ['$age', 30] }, then: '18_29' },
                    { case: { $lt: ['$age', 50] }, then: '30_49' },
                    { case: { $lt: ['$age', 65] }, then: '50_64' }
                  ],
                  default: '65_plus'
                }
              }
            },
            genders: { $push: '$gender' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      analytics.patients = patientAnalytics;
    }

    if (!userType || userType === 'practitioner') {
      const practitionerAnalytics = await Practitioner.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: dateGroupFormat,
            count: { $sum: 1 },
            verified: {
              $sum: {
                $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
              }
            },
            specializations: { $push: '$specialization' },
            avgExperience: { $avg: '$experience' },
            avgRating: { $avg: '$rating' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      analytics.practitioners = practitionerAnalytics;
    }

    res.status(200).json({
      success: true,
      message: 'User analytics retrieved successfully',
      data: {
        analytics,
        parameters: {
          startDate: start,
          endDate: end,
          userType: userType || 'all',
          groupBy
        }
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user analytics',
      error: error.message
    });
  }
};

// Get activity logs with filtering
export const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      adminId,
      action,
      targetType,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};
    
    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      filter.adminId = adminId;
    }
    
    if (action) {
      filter.action = action;
    }
    
    if (targetType) {
      filter.targetType = targetType;
    }
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const [logs, totalCount] = await Promise.all([
      ActivityLog.find(filter)
        .populate('adminId', 'firstName lastName email employeeId')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum),
      ActivityLog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      message: 'Activity logs retrieved successfully',
      data: {
        logs: logs.map(log => ({
          _id: log._id,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          description: log.description,
          admin: log.adminId ? {
            id: log.adminId._id,
            name: `${log.adminId.firstName} ${log.adminId.lastName}`,
            email: log.adminId.email,
            employeeId: log.adminId.employeeId
          } : null,
          metadata: log.metadata,
          ipAddress: log.ipAddress,
          timestamp: log.timestamp
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalLogs: totalCount,
          logsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity logs',
      error: error.message
    });
  }
};

// Export data
export const exportData = async (req, res) => {
  try {
    const { 
      type, // 'users', 'practitioners', 'admins', 'logs'
      format = 'json', // 'json', 'csv'
      startDate,
      endDate,
      filters = {}
    } = req.body;

    let data = [];
    let filename = '';

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    switch (type) {
      case 'users':
        const patients = await Patient.find({
          ...filters,
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
        }).select('-password').lean();
        
        data = patients.map(p => ({ ...p, userType: 'patient' }));
        filename = `users_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'practitioners':
        data = await Practitioner.find({
          ...filters,
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
        }).select('-password').lean();
        
        data = data.map(p => ({ ...p, userType: 'practitioner' }));
        filename = `practitioners_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'admins':
        data = await Admin.find({
          ...filters,
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
        }).select('-password -twoFactorSecret').lean();
        
        filename = `admins_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'logs':
        data = await ActivityLog.find({
          ...filters,
          ...(Object.keys(dateFilter).length && { timestamp: dateFilter })
        }).populate('adminId', 'firstName lastName email employeeId').lean();
        
        filename = `activity_logs_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        success: true,
        exportInfo: {
          type,
          format,
          recordCount: data.length,
          exportedAt: new Date().toISOString(),
          filters: { startDate, endDate, ...filters }
        },
        data
      });
    }

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

// Helper functions
async function getUserGrowthData(startDate, timeRange) {
  const groupBy = timeRange === '7d' ? 'day' : timeRange === '30d' ? 'day' : 'month';
  
  const dateGroupFormat = groupBy === 'day' ? {
    year: { $year: '$createdAt' },
    month: { $month: '$createdAt' },
    day: { $dayOfMonth: '$createdAt' }
  } : {
    year: { $year: '$createdAt' },
    month: { $month: '$createdAt' }
  };

  const [patientGrowth, practitionerGrowth] = await Promise.all([
    Patient.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: dateGroupFormat, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    Practitioner.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: dateGroupFormat, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])
  ]);

  return {
    patients: patientGrowth,
    practitioners: practitionerGrowth
  };
}

async function getGeographicDistribution() {
  // This would require location data in your user schemas
  // For now, returning empty array
  return [];
}

async function getErrorRate(startDate) {
  // This would require error logging implementation
  // For now, returning mock data
  return {
    rate: 0.1,
    count: 5
  };
}

function calculateGrowthRate(total, newInRange, timeRange) {
  const previous = total - newInRange;
  if (previous === 0) return newInRange > 0 ? 100 : 0;
  
  const rate = (newInRange / previous) * 100;
  
  // Annualize the rate based on time range
  const daysInRange = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const annualizedRate = (rate * 365) / daysInRange;
  
  return Math.round(annualizedRate * 100) / 100;
}

function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle nested objects and arrays
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Escape commas and quotes in string values
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}