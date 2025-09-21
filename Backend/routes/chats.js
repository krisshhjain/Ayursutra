import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import Appointment from '../models/Appointment.js';
import { Patient, Practitioner } from '../models/User.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/chats
// @desc    Get all chats for the authenticated user
// @access  Private (Patient or Practitioner)
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;

    const chats = await Chat.getChatsForUser(userId, userType);

    res.status(200).json({
      success: true,
      data: chats
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// @route   GET /api/chats/appointment/:appointmentId
// @desc    Get or create chat for a specific appointment
// @access  Private (Patient or Practitioner)
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Find the appointment and verify user has access
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify user has access to this appointment
    const hasAccess = (userType === 'patient' && appointment.patientId.toString() === userId.toString()) ||
                     (userType === 'practitioner' && appointment.practitionerId.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this appointment'
      });
    }

    // Find or create chat
    const chat = await Chat.findOrCreateByAppointment(
      appointmentId,
      appointment.patientId,
      appointment.practitionerId
    );

    // Populate the chat with full details
    const populatedChat = await Chat.findById(chat._id)
      .populate('appointment', 'date slotStartUtc status duration')
      .populate('patient', 'firstName lastName email')
      .populate('practitioner', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      data: populatedChat
    });

  } catch (error) {
    console.error('Get chat by appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: error.message
    });
  }
});

// @route   POST /api/chats/:chatId/messages
// @desc    Send a message in a chat
// @access  Private (Patient or Practitioner)
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    const userType = req.user.userType;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user has access to this chat
    const hasAccess = (userType === 'patient' && chat.patientId.toString() === userId.toString()) ||
                     (userType === 'practitioner' && chat.practitionerId.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Add the message
    await chat.addMessage(content.trim(), userId, userType);

    // Get the updated chat with the new message
    const updatedChat = await Chat.findById(chatId)
      .populate('appointment', 'date slotStartUtc status duration')
      .populate('patient', 'firstName lastName email')
      .populate('practitioner', 'firstName lastName specialization');

    res.status(201).json({
      success: true,
      data: {
        chat: updatedChat,
        message: updatedChat.messages[updatedChat.messages.length - 1]
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// @route   PUT /api/chats/:chatId/read
// @desc    Mark messages as read for the current user
// @access  Private (Patient or Practitioner)
router.put('/:chatId/read', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user has access to this chat
    const hasAccess = (userType === 'patient' && chat.patientId.toString() === userId.toString()) ||
                     (userType === 'practitioner' && chat.practitionerId.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Mark messages as read
    await chat.markAsRead(userType);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// @route   GET /api/chats/:chatId/messages
// @desc    Get messages for a specific chat with pagination
// @access  Private (Patient or Practitioner)
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user has access to this chat
    const hasAccess = (userType === 'patient' && chat.patientId.toString() === userId.toString()) ||
                     (userType === 'practitioner' && chat.practitionerId.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Get messages with pagination (newest first)
    const startIndex = (page - 1) * limit;
    const messages = chat.messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(startIndex, startIndex + parseInt(limit))
      .reverse(); // Reverse to show oldest first in the response

    const totalMessages = chat.messages.length;
    const totalPages = Math.ceil(totalMessages / limit);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMessages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// @route   DELETE /api/chats/:chatId
// @desc    Delete a chat (admin or soft delete)
// @access  Private (Patient or Practitioner - only their own chats)
router.delete('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user has access to this chat
    const hasAccess = (userType === 'patient' && chat.patientId.toString() === userId.toString()) ||
                     (userType === 'practitioner' && chat.practitionerId.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Soft delete - mark as inactive
    chat.isActive = false;
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: error.message
    });
  }
});

// @route   GET /api/chats/unread/count
// @desc    Get unread message count for the authenticated user
// @access  Private (Patient or Practitioner)
router.get('/unread/count', async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;

    const chats = await Chat.getChatsForUser(userId, userType);
    const unreadCount = chats.reduce((total, chat) => {
      return total + (userType === 'patient' ? chat.unreadCount.patient : chat.unreadCount.practitioner);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
        totalChats: chats.length
      }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

export default router;