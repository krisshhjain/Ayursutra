import express from 'express';
import {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotificationToUsers,
  getNotificationStats,
  bulkUpdateNotifications,
  bulkDeleteNotifications
} from '../controllers/systemController.js';
import {
  authenticateAdmin,
  requirePermission,
  logActivity,
  adminRateLimit
} from '../middleware/adminAuth.js';
import {
  validateSystemSettings,
  validateNotification
} from '../middleware/adminValidation.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);
router.use(adminRateLimit());

// System Settings Routes
// @route   GET /api/system/settings
// @desc    Get all system settings
// @access  Private (Admin with system settings permission)
router.get('/settings',
  requirePermission('canManageSystemSettings'),
  getAllSettings
);

// @route   GET /api/system/settings/:key
// @desc    Get specific setting by key
// @access  Private (Admin with system settings permission)
router.get('/settings/:key',
  requirePermission('canManageSystemSettings'),
  getSettingByKey
);

// @route   PUT /api/system/settings
// @desc    Create or update system setting
// @access  Private (Admin with system settings permission)
router.put('/settings',
  requirePermission('canManageSystemSettings'),
  validateSystemSettings,
  logActivity('SYSTEM_SETTINGS_UPDATE', 'system'),
  upsertSetting
);

// @route   DELETE /api/system/settings/:key
// @desc    Delete system setting
// @access  Private (Admin with system settings permission)
router.delete('/settings/:key',
  requirePermission('canManageSystemSettings'),
  logActivity('SYSTEM_SETTINGS_UPDATE', 'system'),
  deleteSetting
);

// Notification Routes
// @route   GET /api/system/notifications
// @desc    Get all notifications
// @access  Private (Admin with notification management permission)
router.get('/notifications',
  requirePermission('canManageNotifications'),
  getAllNotifications
);

// @route   POST /api/system/notifications
// @desc    Create new notification
// @access  Private (Admin with notification management permission)
router.post('/notifications',
  requirePermission('canManageNotifications'),
  validateNotification,
  logActivity('SEND_NOTIFICATION', 'system'),
  createNotification
);

// @route   PUT /api/system/notifications/:id
// @desc    Update notification
// @access  Private (Admin with notification management permission)
router.put('/notifications/:id',
  requirePermission('canManageNotifications'),
  logActivity('MODERATE_CONTENT', 'system'),
  updateNotification
);

// @route   DELETE /api/system/notifications/:id
// @desc    Delete notification
// @access  Private (Admin with notification management permission)
router.delete('/notifications/:id',
  requirePermission('canManageNotifications'),
  logActivity('MODERATE_CONTENT', 'system'),
  deleteNotification
);

// @route   POST /api/system/notifications/:id/send
// @desc    Send notification to specific users
// @access  Private (Admin with notification management permission)
router.post('/notifications/:id/send',
  requirePermission('canManageNotifications'),
  logActivity('SEND_NOTIFICATION', 'system'),
  sendNotificationToUsers
);

// @route   GET /api/system/notifications/stats
// @desc    Get notification statistics
// @access  Private (Admin with analytics permission)
router.get('/notifications/stats',
  requirePermission('canAccessAnalytics'),
  getNotificationStats
);

// Bulk Operations
// @route   PUT /api/system/notifications/bulk
// @desc    Bulk update notifications
// @access  Private (Admin with notification management permission)
router.put('/notifications/bulk',
  requirePermission('canManageNotifications'),
  logActivity('MODERATE_CONTENT', 'system'),
  bulkUpdateNotifications
);

// @route   DELETE /api/system/notifications/bulk
// @desc    Bulk delete notifications
// @access  Private (Admin with notification management permission)
router.delete('/notifications/bulk',
  requirePermission('canManageNotifications'),
  logActivity('MODERATE_CONTENT', 'system'),
  bulkDeleteNotifications
);

export default router;