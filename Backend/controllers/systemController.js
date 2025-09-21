import { SystemSettings, SystemNotification } from '../models/Admin.js';
import { Patient, Practitioner } from '../models/User.js';
import { Admin } from '../models/Admin.js';

// System Settings Controllers

// Get all system settings
export const getAllSettings = async (req, res) => {
  try {
    const { category, isPublic } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    const settings = await SystemSettings.find(filter)
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ category: 1, key: 1 });

    res.status(200).json({
      success: true,
      message: 'System settings retrieved successfully',
      data: { settings }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system settings',
      error: error.message
    });
  }
};

// Get specific setting by key
export const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await SystemSettings.findOne({ key })
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Setting retrieved successfully',
      data: { setting }
    });

  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve setting',
      error: error.message
    });
  }
};

// Create or update system setting
export const upsertSetting = async (req, res) => {
  try {
    const { key, value, description, category, isPublic = false } = req.body;

    const setting = await SystemSettings.findOneAndUpdate(
      { key },
      {
        value,
        description,
        category,
        isPublic,
        lastModifiedBy: req.admin._id,
        lastModified: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    ).populate('lastModifiedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Setting updated successfully',
      data: { setting }
    });

  } catch (error) {
    console.error('Upsert setting error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Setting key already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
};

// Delete system setting
export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await SystemSettings.findOneAndDelete({ key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Setting deleted successfully'
    });

  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete setting',
      error: error.message
    });
  }
};

// Notification Controllers

// Get all notifications with filters
export const getAllNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      targetAudience,
      priority,
      isActive,
      createdBy
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (targetAudience) filter.targetAudience = targetAudience;
    if (priority) filter.priority = priority;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (createdBy) filter.createdBy = createdBy;

    const [notifications, totalCount] = await Promise.all([
      SystemNotification.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      SystemNotification.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalNotifications: totalCount,
          notificationsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

// Create new notification
export const createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      targetAudience = 'all',
      priority = 'medium',
      scheduledFor,
      expiresAt
    } = req.body;

    const notification = new SystemNotification({
      title,
      message,
      type,
      targetAudience,
      priority,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: req.admin._id
    });

    await notification.save();
    await notification.populate('createdBy', 'firstName lastName email');

    // If not scheduled, send immediately
    if (!scheduledFor || new Date(scheduledFor) <= new Date()) {
      // Here you would integrate with your notification service
      // For now, we'll just mark as active
      notification.isActive = true;
      await notification.save();
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Update notification
export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.readBy;

    const notification = await SystemNotification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification updated successfully',
      data: { notification }
    });

  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await SystemNotification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Send notification to specific users
export const sendNotificationToUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds, userType } = req.body;

    const notification = await SystemNotification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Here you would implement the actual notification sending logic
    // This could involve email, SMS, push notifications, etc.
    
    // For now, we'll simulate by updating the notification's readBy array
    const sentCount = userIds.length;
    
    res.status(200).json({
      success: true,
      message: `Notification sent to ${sentCount} users`,
      data: {
        notificationId: id,
        sentTo: sentCount,
        userType
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = Object.keys(dateFilter).length 
      ? { createdAt: dateFilter }
      : {};

    const [
      totalNotifications,
      activeNotifications,
      notificationsByType,
      notificationsByAudience,
      notificationsByPriority
    ] = await Promise.all([
      SystemNotification.countDocuments(matchStage),
      SystemNotification.countDocuments({ ...matchStage, isActive: true }),
      SystemNotification.aggregate([
        { $match: matchStage },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      SystemNotification.aggregate([
        { $match: matchStage },
        { $group: { _id: '$targetAudience', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      SystemNotification.aggregate([
        { $match: matchStage },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      overview: {
        total: totalNotifications,
        active: activeNotifications,
        inactive: totalNotifications - activeNotifications
      },
      breakdown: {
        byType: notificationsByType,
        byAudience: notificationsByAudience,
        byPriority: notificationsByPriority
      },
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    };

    res.status(200).json({
      success: true,
      message: 'Notification statistics retrieved successfully',
      data: { stats }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification statistics',
      error: error.message
    });
  }
};

// Bulk operations
export const bulkUpdateNotifications = async (req, res) => {
  try {
    const { notificationIds, updateData } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    // Remove fields that shouldn't be bulk updated
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;

    const result = await SystemNotification.updateMany(
      { _id: { $in: notificationIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message: 'Notifications updated successfully',
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Bulk update notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update notifications',
      error: error.message
    });
  }
};

export const bulkDeleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    const result = await SystemNotification.deleteMany({
      _id: { $in: notificationIds }
    });

    res.status(200).json({
      success: true,
      message: 'Notifications deleted successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Bulk delete notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete notifications',
      error: error.message
    });
  }
};