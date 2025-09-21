import { verifyToken } from '../utils/jwt.js';
import { Admin, ActivityLog } from '../models/Admin.js';

// Enhanced authentication middleware for admins
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Only allow admin userType
    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const admin = await Admin.findById(decoded.userId).select('-password -twoFactorSecret');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin not found.'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    if (admin.isSuspended) {
      return res.status(401).json({
        success: false,
        message: `Account is suspended. Reason: ${admin.suspensionReason || 'Administrative action'}`
      });
    }

    // Check session timeout
    const lastLoginTime = admin.lastLogin?.getTime() || 0;
    const sessionTimeoutMs = admin.sessionTimeout * 1000;
    const currentTime = Date.now();
    
    if (currentTime - lastLoginTime > sessionTimeoutMs) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    req.admin = admin;
    req.userType = 'admin';
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

// Permission-based authorization middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!req.admin.hasPermission(permission) && !req.admin.isSuperAdmin()) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`
      });
    }

    next();
  };
};

// Admin level authorization
export const requireAdminLevel = (...levels) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!levels.includes(req.admin.adminLevel)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required admin level: ${levels.join(' or ')}`
      });
    }

    next();
  };
};

// Super admin only middleware
export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || !req.admin.isSuperAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

// Activity logging middleware
export const logActivity = (action, targetType) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to log after response
    res.json = function(data) {
      // Log the activity if the request was successful
      if (req.admin && res.statusCode < 400) {
        const activityLog = new ActivityLog({
          adminId: req.admin._id,
          action,
          targetType,
          targetId: req.params.id || req.body.targetId || null,
          description: generateActivityDescription(action, req),
          metadata: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            requestBody: sanitizeRequestBody(req.body),
            params: req.params,
            query: req.query
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        });

        activityLog.save().catch(error => {
          console.error('Failed to log activity:', error);
        });
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Helper function to generate activity descriptions
function generateActivityDescription(action, req) {
  const descriptions = {
    'CREATE_USER': `Created new user`,
    'UPDATE_USER': `Updated user profile`,
    'DELETE_USER': `Deleted user account`,
    'SUSPEND_USER': `Suspended user account`,
    'CREATE_PRACTITIONER': `Created new practitioner`,
    'UPDATE_PRACTITIONER': `Updated practitioner profile`,
    'DELETE_PRACTITIONER': `Deleted practitioner account`,
    'VERIFY_PRACTITIONER': `Verified practitioner credentials`,
    'CREATE_ADMIN': `Created new admin account`,
    'UPDATE_ADMIN': `Updated admin account`,
    'DELETE_ADMIN': `Deleted admin account`,
    'LOGIN': `Admin logged in`,
    'LOGOUT': `Admin logged out`,
    'PASSWORD_CHANGE': `Changed password`,
    'SYSTEM_SETTINGS_UPDATE': `Updated system settings`,
    'VIEW_ANALYTICS': `Accessed analytics dashboard`,
    'EXPORT_DATA': `Exported data`,
    'SEND_NOTIFICATION': `Sent notification`,
    'MODERATE_CONTENT': `Moderated content`
  };

  let description = descriptions[action] || `Performed ${action}`;
  
  // Add specific details based on request
  if (req.params.id) {
    description += ` (ID: ${req.params.id})`;
  }
  
  if (req.body.email) {
    description += ` for ${req.body.email}`;
  }

  return description;
}

// Helper function to sanitize request body for logging
function sanitizeRequestBody(body) {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.confirmPassword;
  delete sanitized.twoFactorSecret;
  delete sanitized.token;
  
  return sanitized;
}

// Rate limiting for admin actions
export const adminRateLimit = (windowMs = 60000, max = 30) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.admin) return next();
    
    const adminId = req.admin._id.toString();
    const now = Date.now();
    
    if (!requests.has(adminId)) {
      requests.set(adminId, []);
    }
    
    const adminRequests = requests.get(adminId);
    
    // Remove requests outside the window
    const validRequests = adminRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down.'
      });
    }
    
    validRequests.push(now);
    requests.set(adminId, validRequests);
    
    next();
  };
};

// IP whitelist middleware for sensitive operations
export const requireWhitelistedIP = (whitelistedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Skip in development or if no whitelist provided
    if (process.env.NODE_ENV === 'development' || whitelistedIPs.length === 0) {
      return next();
    }
    
    if (!whitelistedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address.'
      });
    }
    
    next();
  };
};