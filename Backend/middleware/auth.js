import { verifyToken } from '../utils/jwt.js';
import { Patient, Practitioner } from '../models/User.js';

// Middleware to authenticate JWT token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = verifyToken(token);
    
    // Find user based on userType
    let user;
    if (decoded.userType === 'patient') {
      user = await Patient.findById(decoded.userId).select('-password');
    } else if (decoded.userType === 'practitioner') {
      user = await Practitioner.findById(decoded.userId).select('-password');
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Unsupported user type.'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

// Middleware to authorize specific user types
export const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required user type: ${userTypes.join(' or ')}`
      });
    }
    next();
  };
};

// Middleware to check if user is the owner of the resource
export const authorizeOwner = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user._id.toString() !== resourceUserId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  }
  
  next();
};