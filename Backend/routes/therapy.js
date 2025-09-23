import express from 'express';
import TherapyTemplate from '../models/TherapyTemplate.js';
import TherapyProgram from '../models/TherapyProgram.js';
import { User, Patient, Practitioner } from '../models/User.js';
import Appointment from '../models/Appointment.js';
import TherapySchedulingService from '../services/TherapySchedulingService.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { PANCHAKARMA_PROCEDURES, generateProcedureSchedule } from '../models/PanchakarmaTemplates.js';
import { COMPLETE_PANCHAKARMA_PROGRAM, generateCompletePanchakarmaProgram } from '../models/CompletePanchakarmaProgram.js';

const router = express.Router();

// ==================== THERAPY TEMPLATES ====================

/**
 * GET /api/therapy/templates
 * Get all therapy templates or filter by category
 */
router.get('/templates', authenticate, async (req, res) => {
  try {
    const { category, subcategory, practitionerId } = req.query;
    let templates;

    if (practitionerId) {
      // Get templates suitable for specific practitioner
      const practitioner = await User.findById(practitionerId);
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      templates = await TherapyTemplate.findForPractitioner(
        practitionerId,
        practitioner.experienceLevel || 'intermediate',
        practitioner.certifications || []
      );
    } else if (category) {
      templates = await TherapyTemplate.findByCategory(category, subcategory);
    } else {
      templates = await TherapyTemplate.find({ isActive: true }).sort({ category: 1, name: 1 });
    }

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching therapy templates:', error);
    res.status(500).json({ message: 'Failed to fetch therapy templates' });
  }
});

/**
 * GET /api/therapy/templates/:id
 * Get specific therapy template details
 */
router.get('/templates/:id', authenticate, async (req, res) => {
  try {
    const template = await TherapyTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Therapy template not found' });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching therapy template:', error);
    res.status(500).json({ message: 'Failed to fetch therapy template' });
  }
});

/**
 * POST /api/therapy/templates
 * Create new therapy template (Admin/Expert practitioners only)
 */
router.post('/templates', authenticate, async (req, res) => {
  try {
    // Check permissions
    if (req.userType !== 'admin' && 
        (req.userType !== 'practitioner' || req.user.experienceLevel !== 'expert')) {
      return res.status(403).json({ message: 'Insufficient permissions to create therapy templates' });
    }

    const template = new TherapyTemplate({
      ...req.body,
      createdBy: req.user._id
    });

    // Validate session sequence
    const validation = template.validateSessionSequence();
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Invalid session sequence',
        errors: validation.errors
      });
    }

    await template.save();

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating therapy template:', error);
    res.status(500).json({ message: 'Failed to create therapy template' });
  }
});

// ==================== THERAPY PROGRAMS ====================

/**
 * GET /api/therapy/programs
 * Get therapy programs for the authenticated user
 */
router.get('/programs', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // Build query based on user type
    if (req.userType === 'patient') {
      query.patientId = req.user._id;
    } else if (req.userType === 'practitioner') {
      query.primaryPractitionerId = req.user._id;
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Fetch programs with populated patient and practitioner data
    const programs = await TherapyProgram.find(query)
      .populate({
        path: 'patientId',
        model: 'Patient',
        select: 'firstName lastName email mobile'
      })
      .populate({
        path: 'primaryPractitionerId',
        model: 'Practitioner', 
        select: 'firstName lastName specialization'
      })
      .populate('templateId', 'name category')
      .sort({ createdAt: -1 });

    // Ensure proper canStart initialization for existing programs
    for (const program of programs) {
      if (program.procedureDetails && Array.isArray(program.procedureDetails) && program.procedureDetails.length > 0) {
        let needsUpdate = false;
        
        // Check if any procedure is missing canStart property
        program.procedureDetails.forEach((procedure, index) => {
          if (procedure.canStart === undefined) {
            needsUpdate = true;
            
            if (index === 0) {
              // First procedure (Vamana) can always start
              procedure.canStart = true;
            } else {
              // Check if previous procedure is completed
              const previousProcedure = program.procedureDetails[index - 1];
              procedure.canStart = previousProcedure.isCompleted === true;
            }
          }
        });
        
        if (needsUpdate) {
          await program.save();
        }
      }
    }

    // Debug logging to check patient data
    console.log('Therapy Programs Debug - Full Data:');
    programs.forEach(program => {
      console.log(`Program ID: ${program._id}`);
      console.log(`PatientId Field: ${program.patientId}`);
      console.log(`Patient Data:`, program.patientId);
      console.log(`Primary Practitioner:`, program.primaryPractitionerId);
      console.log(`Procedure Details Type:`, typeof program.procedureDetails);
      console.log(`Procedure Details:`, program.procedureDetails);
      console.log('---');
    });

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    console.error('Error fetching therapy programs:', error);
    res.status(500).json({ message: 'Failed to fetch therapy programs' });
  }
});

/**
 * GET /api/therapy/programs/:id
 * Get specific therapy program details
 */
router.get('/programs/:id', authenticate, async (req, res) => {
  try {
    const program = await TherapyProgram.findById(req.params.id)
      .populate({
        path: 'patientId',
        model: 'Patient',
        select: 'firstName lastName email mobile'
      })
      .populate({
        path: 'templateId',
        select: 'name description'
      })
      .populate({
        path: 'primaryPractitionerId',
        model: 'Practitioner',
        select: 'firstName lastName specialization'
      })
      .populate({
        path: 'assistingPractitioners.practitionerId',
        model: 'Practitioner',
        select: 'firstName lastName specialization'
      });

    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    // Check access permissions
    const hasAccess = req.userType === 'admin' ||
                     program.patientId._id.toString() === req.user._id ||
                     program.primaryPractitionerId._id.toString() === req.user._id ||
                     program.assistingPractitioners.some(ap => ap.practitionerId._id.toString() === req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this therapy program' });
    }

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Error fetching therapy program:', error);
    res.status(500).json({ message: 'Failed to fetch therapy program' });
  }
});

/**
 * GET /api/therapy/panchakarma-procedures
 * Get available Panchakarma procedures with their scheduling templates
 */
router.get('/panchakarma-procedures', authenticate, async (req, res) => {
  try {
    const procedures = Object.entries(PANCHAKARMA_PROCEDURES).map(([key, procedure]) => ({
      id: key,
      name: procedure.name,
      description: procedure.description,
      totalDuration: procedure.totalDuration,
      phases: {
        purvaKarma: procedure.phases.purvaKarma.duration,
        pradhanaKarma: procedure.phases.pradhanaKarma.duration,
        paschatKarma: procedure.phases.paschatKarma.duration
      },
      indications: procedure.indications,
      contraindications: procedure.contraindications
    }));

    res.json({
      success: true,
      data: procedures
    });
  } catch (error) {
    console.error('Error fetching Panchakarma procedures:', error);
    res.status(500).json({ message: 'Failed to fetch Panchakarma procedures' });
  }
});

/**
 * POST /api/therapy/panchakarma-schedule
 * Generate schedule for a specific Panchakarma procedure
 */
router.post('/panchakarma-schedule', authenticate, async (req, res) => {
  try {
    const { procedureType, customDurations } = req.body;

    if (!procedureType || !PANCHAKARMA_PROCEDURES[procedureType]) {
      return res.status(400).json({ 
        message: 'Invalid procedure type. Available types: ' + Object.keys(PANCHAKARMA_PROCEDURES).join(', ')
      });
    }

    const schedule = generateProcedureSchedule(procedureType, customDurations);

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error generating Panchakarma schedule:', error);
    res.status(500).json({ message: 'Failed to generate schedule: ' + error.message });
  }
});

router.post('/programs', authenticate, async (req, res) => {
  try {
    const { patientId, templateId, programType, primaryPractitionerId, startDate, preferences, notes } = req.body;

    // Debug logging
    console.log('Therapy program creation request:');
    console.log('Request body:', req.body);
    console.log('User from auth:', req.user);
    console.log('User type:', req.userType);
    console.log('PatientId received:', patientId);

    // Validate that the patientId exists in the database
    const patient = await Patient.findById(patientId);
    console.log('Patient found:', patient ? `${patient.firstName} ${patient.lastName}` : 'NOT FOUND');
    
    if (!patient) {
      return res.status(400).json({ 
        message: 'Patient not found with the provided patientId',
        patientId: patientId
      });
    }

    // Validate required fields
    if (!patientId || !primaryPractitionerId || !startDate) {
      console.log('Missing required fields:');
      console.log('patientId:', patientId);
      console.log('primaryPractitionerId:', primaryPractitionerId);
      console.log('startDate:', startDate);
      
      return res.status(400).json({ 
        message: 'Missing required fields: patientId, primaryPractitionerId, startDate',
        received: { patientId, primaryPractitionerId, startDate }
      });
    }

    if (!templateId && !programType) {
      return res.status(400).json({ 
        message: 'Either templateId or programType must be provided' 
      });
    }

    // Check permissions - only practitioners and admins can create programs
    if (req.userType === 'patient') {
      return res.status(403).json({ 
        message: 'Patients cannot directly create therapy programs. Please book through a practitioner.' 
      });
    }

    let finalTemplateId = templateId;

    // If programType is provided (simplified creation), find default template
    if (programType && !templateId) {
      let defaultTemplate;
      
      if (programType === 'panchakarma') {
        // Find a default Panchakarma template
        defaultTemplate = await TherapyTemplate.findOne({ 
          category: 'panchakarma', 
          isActive: true 
        }).sort({ createdAt: 1 }); // Get the first available
      }

      if (!defaultTemplate) {
        // Create comprehensive Panchakarma program with all 5 traditional procedures
        const startDateObj = new Date(startDate);
        
        // Generate complete Panchakarma program schedule
        const completePanchakarmaSchedule = generateCompletePanchakarmaProgram(startDateObj, req.body.customizations);
        
        // Create sessions based on the complete program schedule
        const sessions = completePanchakarmaSchedule.schedule.map((sessionTemplate, index) => {
          return {
            sessionNumber: index + 1,
            templateSessionId: null, // No template needed for authentic procedures
            scheduledDate: sessionTemplate.date,
            scheduledTime: '10:00', // Default time, can be customized
            duration: sessionTemplate.type === 'procedure' ? 120 : 60, // Procedure sessions are longer
            status: 'scheduled',
            practitionerId: primaryPractitionerId,
            sessionName: sessionTemplate.sessionName,
            activities: sessionTemplate.activities,
            phase: sessionTemplate.phase,
            procedureId: sessionTemplate.procedureId || null,
            procedureName: sessionTemplate.procedureName || null,
            procedurePhase: sessionTemplate.procedurePhase || null,
            type: sessionTemplate.type,
            notes: `${sessionTemplate.phase} - Day ${sessionTemplate.day}`
          };
        });
        
        const basicPanchakarmaProgram = await TherapyProgram.create({
          templateId: null,
          programName: 'Complete Panchakarma Therapy Program',
          category: 'panchakarma',
          patientId,
          primaryPractitionerId,
          startDate: startDateObj,
          expectedEndDate: completePanchakarmaSchedule.expectedEndDate,
          status: 'scheduled',
          sessions: sessions,
          progress: {
            currentPhase: 'preparation',
            phaseInfo: {
              name: 'Initial Assessment Phase',
              description: 'Complete health evaluation and program planning',
              nextAction: 'Begin initial assessment and program planning'
            },
            percentageComplete: 0,
            completedSessions: 0,
            totalSessions: completePanchakarmaSchedule.schedule.length,
            procedureProgress: completePanchakarmaSchedule.proceduresSummary.map(proc => ({
              id: proc.id,
              name: proc.name,
              status: 'pending',
              completedDays: 0,
              totalDays: proc.duration,
              canStart: proc.id === 'vamana', // Only first procedure can start initially
              startDate: null,
              completionDate: null
            })),
            milestones: [
              {
                name: 'Assessment Completion',
                description: 'Complete initial health assessment and program planning',
                targetDate: new Date(startDateObj.getTime() + (5 * 24 * 60 * 60 * 1000)),
                status: 'pending'
              },
              {
                name: 'Vamana Completion',
                description: 'Complete Vamana (Therapeutic Emesis) procedure',
                targetDate: new Date(startDateObj.getTime() + (25 * 24 * 60 * 60 * 1000)),
                status: 'pending'
              },
              {
                name: 'All Procedures Completion',
                description: 'Complete all five Panchakarma procedures',
                targetDate: new Date(startDateObj.getTime() + (75 * 24 * 60 * 60 * 1000)),
                status: 'pending'
              },
              {
                name: 'Full Recovery',
                description: 'Complete recovery and final Rasayana therapy',
                targetDate: completePanchakarmaSchedule.expectedEndDate,
                status: 'pending'
              }
            ]
          },
          billing: {
            totalCost: 0,
            paidAmount: 0,
            paymentStatus: 'pending',
            paymentMethod: '',
            paymentDate: null
          },
          procedureDetails: completePanchakarmaSchedule.proceduresSummary.map(proc => ({
            type: proc.id,
            status: 'scheduled',
            scheduledDates: {
              purvaKarma: null,
              pradhanaKarma: null,
              paschatKarma: null
            },
            actualDates: {},
            duration: {
              purvaKarma: proc.phases?.purvaKarma || 0,
              pradhanaKarma: proc.phases?.pradhanaKarma || 0,
              paschatKarma: proc.phases?.paschatKarma || 0
            },
            instructions: {
              preInstructions: '',
              postInstructions: '',
              dietaryRestrictions: '',
              medicineSchedule: ''
            },
            notes: '',
            isCompleted: false,
            completedAt: null
          })),
          notes: notes || 'Panchakarma therapy program created from appointment',
          createdBy: primaryPractitionerId
        });

        return res.status(201).json({
          success: true,
          data: {
            programId: basicPanchakarmaProgram._id,
            ...basicPanchakarmaProgram.toObject()
          },
          message: 'Panchakarma therapy program created successfully'
        });
      }

      finalTemplateId = defaultTemplate._id;
    }

    // Create the therapy program using existing service
    const program = await TherapySchedulingService.createTherapyProgram(
      patientId,
      finalTemplateId,
      primaryPractitionerId,
      startDate,
      preferences
    );

    res.status(201).json({
      success: true,
      data: {
        programId: program._id,
        ...program
      },
      message: 'Therapy program created successfully'
    });
  } catch (error) {
    console.error('Error creating therapy program:', error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /api/therapy/programs/:id/sessions/:sessionNumber/reschedule
 * Reschedule a therapy session
 */
router.put('/programs/:id/sessions/:sessionNumber/reschedule', authenticate, async (req, res) => {
  try {
    const { id: programId, sessionNumber } = req.params;
    const { newDate, newTime, reason } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({ message: 'New date and time are required' });
    }

    const rescheduledBy = {
      userId: req.user._id,
      userType: req.userType
    };

    const updatedProgram = await TherapySchedulingService.rescheduleSession(
      programId,
      parseInt(sessionNumber),
      newDate,
      newTime,
      rescheduledBy,
      reason || 'No reason provided'
    );

    res.json({
      success: true,
      data: updatedProgram,
      message: 'Session rescheduled successfully'
    });
  } catch (error) {
    console.error('Error rescheduling session:', error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /api/therapy/programs/:id/sessions/:sessionNumber/complete
 * Mark a therapy session as completed
 */
router.put('/programs/:id/sessions/:sessionNumber/complete', authenticate, async (req, res) => {
  try {
    const { id: programId, sessionNumber } = req.params;
    const { practitionerNotes, patientFeedback } = req.body;

    // Only practitioners can mark sessions as completed
    if (req.userType !== 'practitioner') {
      return res.status(403).json({ message: 'Only practitioners can mark sessions as completed' });
    }

    const program = await TherapyProgram.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    // Check if practitioner has access to this program
    const hasAccess = program.primaryPractitionerId.toString() === req.user._id ||
                     program.assistingPractitioners.some(ap => ap.practitionerId.toString() === req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this therapy program' });
    }

    const updatedProgram = await program.completeSession(
      parseInt(sessionNumber),
      practitionerNotes,
      patientFeedback
    );

    res.json({
      success: true,
      data: updatedProgram,
      message: 'Session marked as completed'
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * POST /api/therapy/programs/:id/sessions/:sessionNumber/feedback
 * Submit patient feedback for a session
 */
router.post('/programs/:id/sessions/:sessionNumber/feedback', authenticate, async (req, res) => {
  try {
    const { id: programId, sessionNumber } = req.params;
    const feedback = req.body;

    const program = await TherapyProgram.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    // Check if patient has access to this program
    if (req.userType === 'patient' && program.patientId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Access denied to this therapy program' });
    }

    const session = program.sessions.find(s => s.sessionNumber === parseInt(sessionNumber));
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Can only provide feedback for completed sessions' });
    }

    // Update session feedback
    session.patientFeedback = {
      ...feedback,
      submittedAt: new Date()
    };

    await program.save();

    res.json({
      success: true,
      data: session,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

/**
 * GET /api/therapy/upcoming-sessions
 * Get upcoming therapy sessions for the authenticated user
 */
router.get('/upcoming-sessions', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const upcomingSessions = await TherapySchedulingService.getUpcomingTherapySessions(
      req.user._id,
      req.userType,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: upcomingSessions
    });
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming sessions' });
  }
});

/**
 * PUT /api/therapy/programs/:id/procedures
 * Update procedure details for a therapy program
 */
router.put('/programs/:id/procedures', authenticate, async (req, res) => {
  try {
    const { procedures } = req.body;
    
    const program = await TherapyProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    // Check if user has permission to update this program
    if (req.userType === 'practitioner' && program.primaryPractitionerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this program' });
    }

    // Update procedure details
    if (procedures && Array.isArray(procedures)) {
      program.procedureDetails = procedures.map(proc => ({
        type: proc.type,
        status: proc.status || 'scheduled',
        scheduledDates: {
          purvaKarma: proc.scheduledDates?.purvaKarma || null,
          pradhanaKarma: proc.scheduledDates?.pradhanaKarma || null,
          paschatKarma: proc.scheduledDates?.paschatKarma || null
        },
        actualDates: proc.actualDates || {},
        duration: proc.duration || {},
        instructions: {
          preInstructions: proc.instructions?.preInstructions || '',
          postInstructions: proc.instructions?.postInstructions || '',
          dietaryRestrictions: proc.instructions?.dietaryRestrictions || '',
          medicineSchedule: proc.instructions?.medicineSchedule || ''
        },
        notes: proc.notes || '',
        isCompleted: proc.isCompleted || false,
        completedAt: proc.completedAt || null
      }));
      
      program.lastModified = new Date();
      await program.save();
    }

    res.json({
      success: true,
      message: 'Procedure details updated successfully',
      data: program
    });
  } catch (error) {
    console.error('Error updating procedure details:', error);
    res.status(500).json({ message: 'Failed to update procedure details' });
  }
});

/**
 * POST /api/therapy/programs/:id/procedures/:procedureType/start
 * Start a specific procedure with proper sequencing
 */
router.post('/programs/:id/procedures/:procedureType/start', authenticate, async (req, res) => {
  try {
    const { id, procedureType } = req.params;
    const { scheduledDates, instructions } = req.body;
    
    const program = await TherapyProgram.findById(id);
    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    console.log('Starting procedure debug:');
    console.log('Program ID:', id);
    console.log('Procedure Type:', procedureType);
    console.log('Program procedureDetails type:', typeof program.procedureDetails);

    // Check permission
    if (req.userType === 'practitioner' && program.primaryPractitionerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this program' });
    }

    // Handle legacy schema - if procedureDetails is not an array, convert it
    if (!Array.isArray(program.procedureDetails)) {
      console.log('Converting legacy procedureDetails to array format');
      
      // Create default procedures array for complete Panchakarma program
      const defaultProcedures = [
        { type: 'vamana', status: 'scheduled', scheduledDates: {}, actualDates: {}, duration: {}, instructions: {}, notes: '', isCompleted: false, canStart: true },
        { type: 'virechana', status: 'scheduled', scheduledDates: {}, actualDates: {}, duration: {}, instructions: {}, notes: '', isCompleted: false, canStart: false },
        { type: 'basti', status: 'scheduled', scheduledDates: {}, actualDates: {}, duration: {}, instructions: {}, notes: '', isCompleted: false, canStart: false },
        { type: 'nasya', status: 'scheduled', scheduledDates: {}, actualDates: {}, duration: {}, instructions: {}, notes: '', isCompleted: false, canStart: false },
        { type: 'raktamokshana', status: 'scheduled', scheduledDates: {}, actualDates: {}, duration: {}, instructions: {}, notes: '', isCompleted: false, canStart: false }
      ];
      
      program.procedureDetails = defaultProcedures;
      
      // Ensure the first procedure is marked as startable
      if (program.procedureDetails.length > 0) {
        program.procedureDetails[0].canStart = true;
      }
      
      await program.save();
    }

    // Find the procedure to start
    const procedureIndex = program.procedureDetails.findIndex(p => p.type === procedureType);
    if (procedureIndex === -1) {
      return res.status(404).json({ message: 'Procedure not found' });
    }

    const procedure = program.procedureDetails[procedureIndex];
    
    console.log(`Procedure start validation for ${procedureType}:`);
    console.log(`Procedure canStart:`, procedure.canStart);
    console.log(`Is first procedure:`, procedure.type === 'vamana');
    console.log(`Procedure status:`, procedure.status);
    
    // Debug: Show current state of all procedures
    console.log('Current procedure states:');
    program.procedureDetails.forEach(p => {
      console.log(`  ${p.type}: status=${p.status}, isCompleted=${p.isCompleted}, canStart=${p.canStart}, feedbackReceived=${p.feedbackReceived}`);
    });
    
    // Check if this procedure can be started (sequential requirement)
    // Special case: Vamana (first procedure) can always be started if it's scheduled
    const isFirstProcedure = procedure.type === 'vamana';
    
    // For non-first procedures, check if all previous procedures are completed
    let canStart = isFirstProcedure;
    
    if (!isFirstProcedure) {
      // Get all procedures before this one in the standard Panchakarma sequence
      const procedureOrder = ['vamana', 'virechana', 'basti', 'nasya', 'raktamokshana'];
      const currentIndex = procedureOrder.indexOf(procedureType);
      
      if (currentIndex === -1) {
        return res.status(400).json({ message: 'Invalid procedure type' });
      }
      
      // Check if all previous procedures are completed
      let allPreviousCompleted = true;
      for (let i = 0; i < currentIndex; i++) {
        const prevProcedureType = procedureOrder[i];
        const prevProcedure = program.procedureDetails.find(p => p.type === prevProcedureType);
        
        if (!prevProcedure || (!prevProcedure.isCompleted && prevProcedure.status !== 'completed')) {
          allPreviousCompleted = false;
          console.log(`Previous procedure ${prevProcedureType} is not completed:`, {
            found: !!prevProcedure,
            isCompleted: prevProcedure?.isCompleted,
            status: prevProcedure?.status
          });
          break;
        }
      }
      
      canStart = allPreviousCompleted || procedure.canStart === true;
      
      console.log(`All previous procedures completed:`, allPreviousCompleted);
      console.log(`Can start ${procedureType}:`, canStart);
    }
    
    if (!canStart) {
      return res.status(400).json({ 
        message: 'This procedure cannot be started yet. Complete previous procedures first.',
        sequence: 'Panchakarma procedures must be completed in sequence: Vamana → Virechana → Basti → Nasya → Raktamokshana'
      });
    }

    // Update procedure status and dates
    procedure.status = 'in-progress';
    procedure.actualDates = procedure.actualDates || {};
    procedure.actualDates.startedAt = new Date();
    
    // Update scheduled dates if provided
    if (scheduledDates) {
      procedure.scheduledDates = {
        ...procedure.scheduledDates,
        ...scheduledDates
      };
    }
    
    // Update instructions if provided
    if (instructions) {
      procedure.instructions = {
        ...procedure.instructions,
        ...instructions
      };
    }
    
    program.status = 'active';
    program.lastModified = new Date();
    
    // Update progress tracking
    if (!program.progress.procedureProgress) {
      program.progress.procedureProgress = [];
    }
    
    const progIndex = program.progress.procedureProgress.findIndex(p => p.id === procedureType || p.type === procedureType);
    if (progIndex >= 0) {
      program.progress.procedureProgress[progIndex].status = 'active';
      program.progress.procedureProgress[progIndex].startDate = new Date();
    } else {
      program.progress.procedureProgress.push({
        id: procedureType,
        name: procedureType.charAt(0).toUpperCase() + procedureType.slice(1),
        type: procedureType, // Keep for backward compatibility
        status: 'active',
        startDate: new Date(),
        completionDate: null,
        feedback: null
      });
    }
    
    await program.save();

    res.json({
      success: true,
      message: `${procedureType} procedure started successfully`,
      data: program,
      nextSteps: {
        patientInstructions: procedure.instructions?.preInstructions || `${procedureType} procedure has been started. Follow practitioner's guidance.`,
        estimatedDuration: procedure.duration || 'As advised by practitioner',
        nextProcedure: procedureIndex < program.procedureDetails.length - 1 ? program.procedureDetails[procedureIndex + 1].type : null
      }
    });
  } catch (error) {
    console.error('Error starting procedure:', error);
    res.status(500).json({ message: 'Failed to start procedure', error: error.message });
  }
});

/**
 * POST /api/therapy/programs/:id/procedures/:procedureType/finish
 * Finish a specific procedure and enable the next one
 */
router.post('/programs/:id/procedures/:procedureType/finish', authenticate, async (req, res) => {
  try {
    const { id, procedureType } = req.params;
    const { notes, patientFeedbackRequired = true } = req.body;
    
    const program = await TherapyProgram.findById(id);
    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    // Check permission
    if (req.userType === 'practitioner' && program.primaryPractitionerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this program' });
    }

    // Find the procedure to finish
    const procedureIndex = program.procedureDetails.findIndex(p => p.type === procedureType);
    if (procedureIndex === -1) {
      return res.status(404).json({ message: 'Procedure not found' });
    }

    const procedure = program.procedureDetails[procedureIndex];
    
    if (procedure.status !== 'in-progress') {
      return res.status(400).json({ message: 'Procedure is not currently in progress' });
    }

    // Mark procedure as completed
    procedure.status = 'completed';
    procedure.isCompleted = true; // Always mark as completed when practitioner finishes
    procedure.completedAt = new Date();
    procedure.actualDates = procedure.actualDates || {};
    procedure.actualDates.practitionerCompletedAt = new Date();
    
    // Track feedback requirement separately if needed
    if (patientFeedbackRequired) {
      procedure.feedbackRequired = true;
      procedure.feedbackReceived = false;
    } else {
      procedure.actualDates.completedAt = new Date();
      procedure.feedbackRequired = false;
      procedure.feedbackReceived = true; // No feedback needed, so consider it "received"
    }
    
    if (notes) {
      procedure.notes = notes;
    }
    
    // Update progress tracking
    const progIndex = program.progress.procedureProgress.findIndex(p => p.id === procedureType || p.type === procedureType);
    if (progIndex >= 0) {
      program.progress.procedureProgress[progIndex].status = 'completed';
      program.progress.procedureProgress[progIndex].completionDate = new Date();
    }
    
    // Enable next procedure when current one is completed
    if (procedureIndex < program.procedureDetails.length - 1) {
      const nextProcedure = program.procedureDetails[procedureIndex + 1];
      nextProcedure.canStart = true;
    }
    
    // Check if all procedures are completed
    const allCompleted = program.procedureDetails.every(p => p.isCompleted);
    if (allCompleted) {
      program.status = 'completed';
      program.actualEndDate = new Date();
    }
    
    program.lastModified = new Date();
    await program.save();

    const response = {
      success: true,
      message: patientFeedbackRequired 
        ? `${procedureType} procedure marked for completion. Awaiting patient feedback.`
        : `${procedureType} procedure completed successfully`,
      data: program,
      feedbackRequired: patientFeedbackRequired,
      nextSteps: {}
    };

    if (patientFeedbackRequired) {
      response.nextSteps = {
        action: 'patient-feedback',
        message: 'Patient must complete feedback form before procedure is marked as fully completed',
        feedbackUrl: `/patient/therapy/${id}/procedures/${procedureType}/feedback`
      };
    } else if (procedureIndex < program.procedureDetails.length - 1) {
      const nextProcedure = program.procedureDetails[procedureIndex + 1];
      response.nextSteps = {
        action: 'next-procedure',
        nextProcedure: nextProcedure.type,
        message: `Next procedure (${nextProcedure.type}) is now available to start`
      };
    } else if (allCompleted) {
      response.nextSteps = {
        action: 'program-completed',
        message: 'All procedures completed! Program finished successfully.',
        reportAvailable: true
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error finishing procedure:', error);
    res.status(500).json({ message: 'Failed to finish procedure' });
  }
});

/**
 * POST /api/therapy/programs/:id/fix-procedures
 * Fix procedure completion status for existing programs
 */
router.post('/programs/:id/fix-procedures', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const program = await TherapyProgram.findById(id);
    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    // Check permission
    if (req.userType === 'practitioner' && program.primaryPractitionerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this program' });
    }

    let updated = false;

    // Fix procedures that have status 'completed' but isCompleted is false
    program.procedureDetails.forEach((procedure, index) => {
      if (procedure.status === 'completed' && !procedure.isCompleted) {
        procedure.isCompleted = true;
        
        // Set feedback flags based on whether feedback is required
        if (procedure.patientFeedback) {
          procedure.feedbackRequired = true;
          procedure.feedbackReceived = true;
        } else {
          procedure.feedbackRequired = true;
          procedure.feedbackReceived = false;
        }
        
        // Enable next procedure if this one is completed
        if (index < program.procedureDetails.length - 1) {
          const nextProcedure = program.procedureDetails[index + 1];
          nextProcedure.canStart = true;
        }
        
        updated = true;
      }
    });

    if (updated) {
      program.lastModified = new Date();
      await program.save();
      
      res.json({
        success: true,
        message: 'Procedure statuses fixed successfully',
        data: program
      });
    } else {
      res.json({
        success: true,
        message: 'No procedures needed fixing',
        data: program
      });
    }
  } catch (error) {
    console.error('Error fixing procedures:', error);
    res.status(500).json({ message: 'Failed to fix procedures' });
  }
});

/**
 * GET /api/therapy/my-programs
 * Get patient's therapy programs
 */
router.get('/my-programs', authenticate, async (req, res) => {
  try {
    if (req.userType !== 'patient') {
      return res.status(403).json({ message: 'Only patients can access this endpoint' });
    }

    const programs = await TherapyProgram.find({ patientId: req.user._id })
      .populate({
        path: 'primaryPractitionerId',
        model: 'Practitioner',
        select: 'firstName lastName email specialization'
      })
      .populate('templateId', 'name description totalDuration estimatedCost')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    console.error('Error fetching patient programs:', error);
    res.status(500).json({ message: 'Failed to fetch therapy programs' });
  }
});

/**
 * POST /api/therapy/request-program
 * Request therapy program (patient)
 */
router.post('/request-program', authenticate, async (req, res) => {
  try {
    if (req.userType !== 'patient') {
      return res.status(403).json({ message: 'Only patients can request therapy programs' });
    }

    const { templateId, message } = req.body;
    const patientId = req.user._id;

    // Find the template
    const template = await TherapyTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Therapy template not found'
      });
    }

    // Create a program with 'requested' status
    const program = new TherapyProgram({
      patientId,
      templateId,
      programName: template.name,
      status: 'requested',
      requestMessage: message,
      createdAt: new Date()
    });

    await program.save();

    res.json({
      success: true,
      message: 'Therapy program request sent successfully',
      data: program
    });
  } catch (error) {
    console.error('Error requesting therapy program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send therapy program request'
    });
  }
});

/**
 * GET /api/practitioner/patients
 * Get practitioner's patients for dropdown (used in therapy creation)
 */
router.get('/practitioner-patients', authenticate, async (req, res) => {
  try {
    if (req.userType !== 'practitioner') {
      return res.status(403).json({ message: 'Only practitioners can access this endpoint' });
    }

    const practitionerId = req.user._id;
    
    // Get unique patients who have had appointments with this practitioner
    const appointments = await Appointment.find({
      practitionerId: practitionerId
    }).populate({
      path: 'patientId',
      model: 'Patient',
      select: 'firstName lastName email'
    });

    // Extract unique patients
    const patientsMap = new Map();
    appointments.forEach(appointment => {
      if (appointment.patientId) {
        patientsMap.set(appointment.patientId._id.toString(), appointment.patientId);
      }
    });

    const patients = Array.from(patientsMap.values());

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('Error fetching practitioner patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
});

/**
 * GET /api/therapy/categories
 * Get available therapy categories and subcategories
 */
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await TherapyTemplate.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          subcategories: { $addToSet: '$subcategory' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching therapy categories:', error);
    res.status(500).json({ message: 'Failed to fetch therapy categories' });
  }
});

/**
 * PUT /api/therapy/programs/:programId/progress
 * Update therapy program progress and phase tracking
 * @access Private (Practitioner only)
 */
router.put('/programs/:programId/progress', authenticate, authorize('practitioner'), async (req, res) => {
  try {
    const { programId } = req.params;
    const { 
      currentPhase, 
      phaseProgress, 
      milestones, 
      sessionUpdate,
      healthMetrics 
    } = req.body;

    const program = await TherapyProgram.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Therapy program not found'
      });
    }

    // Update current phase if provided
    if (currentPhase) {
      program.progress.currentPhase = currentPhase;
    }

    // Update phase-specific progress
    if (phaseProgress) {
      if (phaseProgress.purvaKarma) {
        Object.assign(program.progress.phaseProgress.purvaKarma, phaseProgress.purvaKarma);
      }
      if (phaseProgress.pradhanaKarma) {
        Object.assign(program.progress.phaseProgress.pradhanaKarma, phaseProgress.pradhanaKarma);
      }
      if (phaseProgress.paschatKarma) {
        Object.assign(program.progress.phaseProgress.paschatKarma, phaseProgress.paschatKarma);
      }
    }

    // Update milestones
    if (milestones) {
      milestones.forEach(newMilestone => {
        const existingIndex = program.progress.milestones.findIndex(
          m => m.name === newMilestone.name
        );
        if (existingIndex >= 0) {
          program.progress.milestones[existingIndex] = newMilestone;
        } else {
          program.progress.milestones.push(newMilestone);
        }
      });
    }

    // Update session status if provided
    if (sessionUpdate) {
      const sessionIndex = program.sessions.findIndex(
        s => s.sessionNumber === sessionUpdate.sessionNumber
      );
      if (sessionIndex >= 0) {
        Object.assign(program.sessions[sessionIndex], sessionUpdate);
        
        // Recalculate completed sessions
        program.progress.completedSessions = program.sessions.filter(
          s => s.status === 'completed'
        ).length;
        
        // Update percentage complete
        program.progress.percentageComplete = Math.round(
          (program.progress.completedSessions / program.progress.totalSessions) * 100
        );
      }
    }

    // Add health metrics if provided
    if (healthMetrics) {
      program.healthMetrics.push(healthMetrics);
    }

    await program.save();

    res.json({
      success: true,
      message: 'Therapy progress updated successfully',
      data: {
        currentPhase: program.progress.currentPhase,
        percentageComplete: program.progress.percentageComplete,
        completedSessions: program.progress.completedSessions,
        phaseProgress: program.progress.phaseProgress
      }
    });

  } catch (error) {
    console.error('Error updating therapy progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update therapy progress'
    });
  }
});

/**
 * GET /api/therapy/programs/:programId/real-time-status
 * Get real-time therapy status with current phase and next actions
 * @access Private (Patient or Practitioner)
 */
router.get('/programs/:programId/real-time-status', authenticate, async (req, res) => {
  try {
    const { programId } = req.params;
    
    const program = await TherapyProgram.findById(programId)
      .populate('therapyTemplateId')
      .populate({
        path: 'primaryPractitionerId',
        model: 'Practitioner',
        select: 'firstName lastName specialization'
      })
      .populate({
        path: 'patientId',
        model: 'Patient',
        select: 'firstName lastName'
      });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Therapy program not found'
      });
    }

    // Calculate next session
    const nextSession = program.sessions
      .filter(s => ['scheduled', 'confirmed'].includes(s.status))
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))[0];

    // Get current phase details
    const phaseDetails = {
      'preparation': {
        name: 'Preparation Phase',
        description: 'Initial consultation and assessment',
        nextAction: 'Complete consultation and begin Purva Karma'
      },
      'purva-karma': {
        name: 'Purva Karma (Preparation)',
        description: 'Oleation (Snehana) and Sudation (Swedana) therapy',
        nextAction: program.progress.phaseProgress.purvaKarma.snehanaCompleted 
          ? 'Complete Swedana therapy' 
          : 'Begin Snehana (oleation) therapy'
      },
      'pradhana-karma': {
        name: 'Pradhana Karma (Main Procedure)',
        description: `Main ${program.progress.phaseProgress.pradhanaKarma.procedure || 'Panchakarma'} procedure`,
        nextAction: 'Continue main therapy sessions'
      },
      'paschat-karma': {
        name: 'Paschat Karma (Post-therapy)',
        description: 'Recovery and rejuvenation phase',
        nextAction: 'Follow Samasarjana Krama (dietary regimen)'
      },
      'completed': {
        name: 'Program Completed',
        description: 'Therapy program successfully completed',
        nextAction: 'Schedule follow-up consultation'
      }
    };

    const currentPhaseInfo = phaseDetails[program.progress.currentPhase] || phaseDetails.preparation;

    res.json({
      success: true,
      data: {
        programId: program._id,
        programName: program.programName,
        patient: program.patientId,
        practitioner: program.primaryPractitionerId,
        status: program.status,
        progress: {
          currentPhase: program.progress.currentPhase,
          phaseInfo: currentPhaseInfo,
          percentageComplete: program.progress.percentageComplete,
          completedSessions: program.progress.completedSessions,
          totalSessions: program.progress.totalSessions,
          phaseProgress: program.progress.phaseProgress,
          milestones: program.progress.milestones
        },
        nextSession: nextSession ? {
          sessionNumber: nextSession.sessionNumber,
          scheduledDate: nextSession.scheduledDate,
          scheduledTime: nextSession.scheduledTime,
          practitioner: nextSession.practitionerId
        } : null,
        recentHealthMetrics: program.healthMetrics.slice(-3), // Last 3 entries
        timeline: program.sessions.map(session => ({
          sessionNumber: session.sessionNumber,
          status: session.status,
          scheduledDate: session.scheduledDate,
          actualDate: session.actualStartTime,
          notes: session.practitionerNotes
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching real-time therapy status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch therapy status'
    });
  }
});

/**
 * POST /api/therapy/programs/:id/procedures/:procedureType/patient-feedback
 * Submit patient feedback for a completed procedure
 */
router.post('/programs/:id/procedures/:procedureType/patient-feedback', authenticate, async (req, res) => {
  try {
    const { id, procedureType } = req.params;
    const { 
      // Overall experience
      overallExperience,
      wouldRecommend,
      
      // Positive aspects (1-5 scale)
      positiveAspects: {
        relaxation = 0,
        painRelief = 0,
        energyBoost = 0,
        mentalClarity = 0,
        sleepImprovement = 0,
        digestiveHealth = 0,
        skinGlow = 0,
        stressReduction = 0,
        mobilityImprovement = 0,
        overallWellbeing = 0
      } = {},
      
      // Negative aspects (1-5 scale, where 1 = minimal, 5 = severe)
      negativeAspects: {
        discomfort = 0,
        fatigue = 0,
        nausea = 0,
        headache = 0,
        dizziness = 0,
        skinIrritation = 0,
        digestiveUpset = 0,
        sleepDisturbance = 0,
        emotionalChanges = 0,
        mobilityIssues = 0
      } = {},
      
      // Traditional metrics
      painLevel, 
      energyLevel, 
      sleepQuality, 
      appetiteLevel,
      
      // Additional feedback
      symptoms,
      sideEffects,
      additionalComments,
      specificSymptoms = [],
      treatmentDuration,
      comfortLevel,
      therapistRating
    } = req.body;
    
    const program = await TherapyProgram.findById(id);
    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    // Check if patient has access to this program
    if (req.userType === 'patient' && program.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this therapy program' });
    }

    // Find the procedure
    const procedureIndex = program.procedureDetails.findIndex(p => p.type === procedureType);
    if (procedureIndex === -1) {
      return res.status(404).json({ message: 'Procedure not found' });
    }

    const procedure = program.procedureDetails[procedureIndex];
    
    // Check if procedure is completed and needs feedback
    const isCompleted = procedure.isCompleted || procedure.status === 'completed';
    const needsFeedback = isCompleted && (!procedure.patientFeedback || 
                          (procedure.feedbackRequired && !procedure.feedbackReceived));
    
    if (!needsFeedback) {
      return res.status(400).json({ message: 'This procedure does not require feedback or feedback has already been submitted' });
    }

    // Store comprehensive patient feedback
    const feedback = {
      submittedAt: new Date(),
      
      // Overall ratings
      overallExperience: parseInt(overallExperience) || 0, // 1-5 scale
      wouldRecommend: Boolean(wouldRecommend),
      
      // Positive aspects (1-5 scale)
      positiveAspects: {
        relaxation: parseInt(relaxation) || 0,
        painRelief: parseInt(painRelief) || 0,
        energyBoost: parseInt(energyBoost) || 0,
        mentalClarity: parseInt(mentalClarity) || 0,
        sleepImprovement: parseInt(sleepImprovement) || 0,
        digestiveHealth: parseInt(digestiveHealth) || 0,
        skinGlow: parseInt(skinGlow) || 0,
        stressReduction: parseInt(stressReduction) || 0,
        mobilityImprovement: parseInt(mobilityImprovement) || 0,
        overallWellbeing: parseInt(overallWellbeing) || 0
      },
      
      // Negative aspects (1-5 scale)
      negativeAspects: {
        discomfort: parseInt(discomfort) || 0,
        fatigue: parseInt(fatigue) || 0,
        nausea: parseInt(nausea) || 0,
        headache: parseInt(headache) || 0,
        dizziness: parseInt(dizziness) || 0,
        skinIrritation: parseInt(skinIrritation) || 0,
        digestiveUpset: parseInt(digestiveUpset) || 0,
        sleepDisturbance: parseInt(sleepDisturbance) || 0,
        emotionalChanges: parseInt(emotionalChanges) || 0,
        mobilityIssues: parseInt(mobilityIssues) || 0
      },
      
      // Traditional metrics (backward compatibility)
      painLevel: parseInt(painLevel) || 0, // 1-10 scale
      energyLevel: parseInt(energyLevel) || 0, // 1-10 scale
      sleepQuality: parseInt(sleepQuality) || 0, // 1-5 scale
      appetiteLevel: parseInt(appetiteLevel) || 0, // 1-5 scale
      
      // Additional metrics
      comfortLevel: parseInt(comfortLevel) || 0, // 1-5 scale
      therapistRating: parseInt(therapistRating) || 0, // 1-5 scale
      treatmentDuration: treatmentDuration || '',
      
      // Descriptive feedback
      symptoms: symptoms || [],
      sideEffects: sideEffects || [],
      specificSymptoms: specificSymptoms || [],
      additionalComments: additionalComments || ''
    };

    procedure.patientFeedback = feedback;
    procedure.status = 'completed';
    procedure.isCompleted = true;
    procedure.completedAt = new Date();
    procedure.feedbackReceived = true; // Mark feedback as received
    procedure.actualDates = procedure.actualDates || {};
    procedure.actualDates.feedbackSubmittedAt = new Date();
    
    // Update progress tracking
    const progIndex = program.progress.procedureProgress.findIndex(p => p.id === procedureType || p.type === procedureType);
    if (progIndex >= 0) {
      program.progress.procedureProgress[progIndex].status = 'completed';
      program.progress.procedureProgress[progIndex].completionDate = new Date();
      program.progress.procedureProgress[progIndex].feedback = feedback;
    }
    
    // Enable next procedure if exists
    if (procedureIndex < program.procedureDetails.length - 1) {
      const nextProcedure = program.procedureDetails[procedureIndex + 1];
      nextProcedure.canStart = true;
    }
    
    // Check if all procedures are completed
    const allCompleted = program.procedureDetails.every(p => p.isCompleted);
    if (allCompleted) {
      program.status = 'completed';
      program.actualEndDate = new Date();
    }
    
    program.lastModified = new Date();
    await program.save();

    const response = {
      success: true,
      message: 'Feedback submitted successfully',
      data: procedure,
      nextSteps: {}
    };

    if (procedureIndex < program.procedureDetails.length - 1) {
      const nextProcedure = program.procedureDetails[procedureIndex + 1];
      response.nextSteps = {
        nextProcedure: nextProcedure.type,
        message: `Next procedure (${nextProcedure.type}) is now available`,
        canStart: true
      };
    } else if (allCompleted) {
      response.nextSteps = {
        message: 'All procedures completed! Your complete therapy program is finished.',
        programCompleted: true,
        reportAvailable: true
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error submitting patient feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

/**
 * GET /api/therapy/programs/:id/progress-report
 * Generate comprehensive progress report
 */
router.get('/programs/:id/progress-report', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const program = await TherapyProgram.findById(id)
      .populate({
        path: 'patientId',
        model: 'Patient',
        select: 'firstName lastName email mobile age gender'
      })
      .populate({
        path: 'primaryPractitionerId',
        model: 'Practitioner',
        select: 'firstName lastName specialization'
      });

    if (!program) {
      return res.status(404).json({ message: 'Therapy program not found' });
    }

    // Check access permissions
    const hasAccess = req.userType === 'admin' ||
                     program.patientId._id.toString() === req.user._id.toString() ||
                     program.primaryPractitionerId._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this therapy program' });
    }

    // Calculate overall progress metrics
    const completedProcedures = program.procedureDetails.filter(p => p.isCompleted);
    const totalProcedures = program.procedureDetails.length;
    const completionRate = (completedProcedures.length / totalProcedures) * 100;

    // Analyze patient feedback trends with comprehensive ratings
    const feedbackAnalysis = {
      // Overall metrics
      overallSatisfaction: 0,
      recommendationRate: 0,
      
      // Traditional metrics (backward compatibility)
      averagePainReduction: 0,
      averageEnergyImprovement: 0,
      averageSleepImprovement: 0,
      averageAppetiteImprovement: 0,
      
      // Comprehensive positive aspects averages
      positiveAspectsAverage: {
        relaxation: 0,
        painRelief: 0,
        energyBoost: 0,
        mentalClarity: 0,
        sleepImprovement: 0,
        digestiveHealth: 0,
        skinGlow: 0,
        stressReduction: 0,
        mobilityImprovement: 0,
        overallWellbeing: 0
      },
      
      // Comprehensive negative aspects averages
      negativeAspectsAverage: {
        discomfort: 0,
        fatigue: 0,
        nausea: 0,
        headache: 0,
        dizziness: 0,
        skinIrritation: 0,
        digestiveUpset: 0,
        sleepDisturbance: 0,
        emotionalChanges: 0,
        mobilityIssues: 0
      },
      
      // Additional metrics
      averageComfortLevel: 0,
      averageTherapistRating: 0,
      
      // Legacy data
      commonSideEffects: {},
      positiveSymptoms: {},
      
      // Chart data
      progressByProcedure: [],
      healthMetricsTrend: [],
      positiveAspectsTrend: [],
      negativeAspectsTrend: []
    };

    const feedbacks = completedProcedures
      .map(p => p.patientFeedback)
      .filter(f => f);

    if (feedbacks.length > 0) {
      // Calculate overall metrics
      feedbackAnalysis.overallSatisfaction = feedbacks.reduce((sum, f) => sum + (f.overallExperience || 0), 0) / feedbacks.length;
      feedbackAnalysis.recommendationRate = (feedbacks.filter(f => f.wouldRecommend).length / feedbacks.length) * 100;
      
      // Traditional metrics (backward compatibility)
      feedbackAnalysis.averagePainReduction = feedbacks.reduce((sum, f) => sum + (10 - (f.painLevel || 5)), 0) / feedbacks.length;
      feedbackAnalysis.averageEnergyImprovement = feedbacks.reduce((sum, f) => sum + (f.energyLevel || 0), 0) / feedbacks.length;
      feedbackAnalysis.averageSleepImprovement = feedbacks.reduce((sum, f) => sum + (f.sleepQuality || 0), 0) / feedbacks.length;
      feedbackAnalysis.averageAppetiteImprovement = feedbacks.reduce((sum, f) => sum + (f.appetiteLevel || 0), 0) / feedbacks.length;
      
      // Additional metrics
      feedbackAnalysis.averageComfortLevel = feedbacks.reduce((sum, f) => sum + (f.comfortLevel || 0), 0) / feedbacks.length;
      feedbackAnalysis.averageTherapistRating = feedbacks.reduce((sum, f) => sum + (f.therapistRating || 0), 0) / feedbacks.length;
      
      // Calculate comprehensive positive aspects averages
      Object.keys(feedbackAnalysis.positiveAspectsAverage).forEach(aspect => {
        feedbackAnalysis.positiveAspectsAverage[aspect] = 
          feedbacks.reduce((sum, f) => sum + (f.positiveAspects?.[aspect] || 0), 0) / feedbacks.length;
      });
      
      // Calculate comprehensive negative aspects averages
      Object.keys(feedbackAnalysis.negativeAspectsAverage).forEach(aspect => {
        feedbackAnalysis.negativeAspectsAverage[aspect] = 
          feedbacks.reduce((sum, f) => sum + (f.negativeAspects?.[aspect] || 0), 0) / feedbacks.length;
      });
      
      // Analyze legacy side effects and symptoms
      const allSideEffects = feedbacks.flatMap(f => f.sideEffects || []);
      allSideEffects.forEach(effect => {
        feedbackAnalysis.commonSideEffects[effect] = (feedbackAnalysis.commonSideEffects[effect] || 0) + 1;
      });

      const allSymptoms = feedbacks.flatMap(f => f.symptoms || []);
      allSymptoms.forEach(symptom => {
        feedbackAnalysis.positiveSymptoms[symptom] = (feedbackAnalysis.positiveSymptoms[symptom] || 0) + 1;
      });

      // Create comprehensive progress by procedure data for charts
      feedbackAnalysis.progressByProcedure = completedProcedures.map((procedure, index) => ({
        procedure: procedure.type.charAt(0).toUpperCase() + procedure.type.slice(1),
        overallExperience: procedure.patientFeedback?.overallExperience || 0,
        painLevel: 10 - (procedure.patientFeedback?.painLevel || 5), // Convert to improvement scale
        energyLevel: procedure.patientFeedback?.energyLevel || 0,
        sleepQuality: procedure.patientFeedback?.sleepQuality || 0,
        appetiteLevel: procedure.patientFeedback?.appetiteLevel || 0,
        comfortLevel: procedure.patientFeedback?.comfortLevel || 0,
        therapistRating: procedure.patientFeedback?.therapistRating || 0,
        order: index + 1,
        // Add positive aspects for each procedure
        positiveAspects: procedure.patientFeedback?.positiveAspects || {},
        negativeAspects: procedure.patientFeedback?.negativeAspects || {}
      }));

      // Create enhanced health metrics trend
      feedbackAnalysis.healthMetricsTrend = feedbacks.map((feedback, index) => ({
        procedure: completedProcedures[index]?.type || `Procedure ${index + 1}`,
        painReduction: 10 - (feedback.painLevel || 5),
        energyLevel: feedback.energyLevel || 0,
        sleepQuality: feedback.sleepQuality || 0,
        appetiteLevel: feedback.appetiteLevel || 0,
        overallSatisfaction: feedback.overallExperience || 0,
        comfortLevel: feedback.comfortLevel || 0,
        therapistRating: feedback.therapistRating || 0
      }));

      // Create positive aspects trend data
      feedbackAnalysis.positiveAspectsTrend = feedbacks.map((feedback, index) => {
        const data = {
          procedure: completedProcedures[index]?.type || `Procedure ${index + 1}`,
          procedureIndex: index + 1
        };
        
        // Add all positive aspects
        Object.keys(feedbackAnalysis.positiveAspectsAverage).forEach(aspect => {
          data[aspect] = feedback.positiveAspects?.[aspect] || 0;
        });
        
        return data;
      });

      // Create negative aspects trend data
      feedbackAnalysis.negativeAspectsTrend = feedbacks.map((feedback, index) => {
        const data = {
          procedure: completedProcedures[index]?.type || `Procedure ${index + 1}`,
          procedureIndex: index + 1
        };
        
        // Add all negative aspects
        Object.keys(feedbackAnalysis.negativeAspectsAverage).forEach(aspect => {
          data[aspect] = feedback.negativeAspects?.[aspect] || 0;
        });
        
        return data;
      });
    }

    // Calculate timeline metrics
    const startDate = new Date(program.createdAt);
    const endDate = program.actualEndDate || new Date();
    const totalDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const procedureTimeline = program.procedureDetails.map(procedure => ({
      type: procedure.type,
      status: procedure.status,
      startDate: procedure.actualDates?.startedAt || null,
      completionDate: procedure.completedAt || null,
      duration: procedure.actualDates?.startedAt && procedure.completedAt 
        ? Math.ceil((new Date(procedure.completedAt) - new Date(procedure.actualDates.startedAt)) / (1000 * 60 * 60 * 24))
        : null,
      feedback: procedure.patientFeedback || null
    }));

    const report = {
      programInfo: {
        programId: program._id,
        programName: program.programName,
        patient: {
          name: `${program.patientId.firstName} ${program.patientId.lastName}`,
          age: program.patientId.age,
          gender: program.patientId.gender
        },
        practitioner: {
          name: `${program.primaryPractitionerId.firstName} ${program.primaryPractitionerId.lastName}`,
          specialization: program.primaryPractitionerId.specialization
        },
        startDate: program.createdAt,
        endDate: program.actualEndDate,
        status: program.status,
        totalDuration: totalDuration
      },
      progressMetrics: {
        completionRate: Math.round(completionRate),
        completedProcedures: completedProcedures.length,
        totalProcedures: totalProcedures,
        remainingProcedures: totalProcedures - completedProcedures.length
      },
      procedureTimeline: procedureTimeline,
      feedbackAnalysis: {
        ...feedbackAnalysis,
        overallSatisfaction: Math.round(feedbackAnalysis.overallSatisfaction * 10) / 10,
        averagePainReduction: Math.round(feedbackAnalysis.averagePainReduction * 10) / 10,
        averageEnergyImprovement: Math.round(feedbackAnalysis.averageEnergyImprovement * 10) / 10,
        averageSleepImprovement: Math.round(feedbackAnalysis.averageSleepImprovement * 10) / 10,
        averageAppetiteImprovement: Math.round(feedbackAnalysis.averageAppetiteImprovement * 10) / 10,
        recommendationRate: Math.round(feedbackAnalysis.recommendationRate)
      },
      recommendations: generateRecommendations(program, feedbackAnalysis),
      generatedAt: new Date()
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating progress report:', error);
    res.status(500).json({ message: 'Failed to generate progress report' });
  }
});

// Helper function to generate recommendations based on progress and feedback
function generateRecommendations(program, feedbackAnalysis) {
  const recommendations = [];
  
  if (program.status === 'completed') {
    recommendations.push({
      type: 'follow-up',
      priority: 'medium',
      message: 'Schedule a follow-up consultation in 2-4 weeks to assess long-term benefits'
    });
  }
  
  if (feedbackAnalysis.averagePainReduction < 5) {
    recommendations.push({
      type: 'pain-management',
      priority: 'high',
      message: 'Consider additional pain management techniques or consultation'
    });
  }
  
  if (feedbackAnalysis.averageEnergyImprovement < 6) {
    recommendations.push({
      type: 'energy-boost',
      priority: 'medium',
      message: 'Consider Rasayana therapy or lifestyle modifications to improve energy levels'
    });
  }
  
  if (feedbackAnalysis.averageSleepImprovement < 3) {
    recommendations.push({
      type: 'sleep-quality',
      priority: 'medium',
      message: 'Recommend sleep hygiene practices and potentially Shirodhara therapy'
    });
  }
  
  if (feedbackAnalysis.recommendationRate < 80) {
    recommendations.push({
      type: 'program-improvement',
      priority: 'high',
      message: 'Review program delivery and consider modifications for better patient satisfaction'
    });
  }
  
  return recommendations;
}

export default router;
