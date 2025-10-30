import express from 'express';
import { generatePlan } from '../services/aiService.js';
import StudyPlan from '../models/studyPlan.js';

const router = express.Router();

// Get plans for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const plans = await StudyPlan.find({ 
      userId, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      plans 
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch plans' 
    });
  }
});

// Create new plan
router.post('/', async (req, res) => {
  try {
    const { subject, examDate, userId } = req.body;

    if (!subject?.trim() || !examDate || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'INVALID_INPUT',
        message: 'Subject, examDate and userId are required' 
      });
    }

    // Check for any existing active plans with same subject BEFORE generating new plan
    const normalizedSubject = subject.trim().toLowerCase().replace(/\s+/g, ' ');
    const existingPlan = await StudyPlan.findOne({
      userId,
      'overview.subject': { $regex: new RegExp(`^${normalizedSubject}$`, 'i') },
      isActive: true
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        error: 'PLAN_EXISTS',
        message: `You already have an active study plan for ${subject}. Please check your existing plans or deactivate the current one before creating a new plan.`
      });
    }

    // Only generate and save plan if no existing plan found
    const plan = await generatePlan(subject, userId, examDate);
    const savedPlan = await plan.save();

    return res.json({ 
      success: true, 
      plan: savedPlan 
    });

  } catch (error) {
    console.error('Error in plan generation:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'SERVER_ERROR',
      message: error.message || 'Plan generation failed' 
    });
  }
});

// Delete a plan
router.delete('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Plan ID is required'
      });
    }

    // Instead of deleting, we'll update isActive to false
    const updatedPlan = await StudyPlan.findByIdAndUpdate(
      planId,
      { isActive: false },
      { new: true }
    );
    
    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        error: 'PLAN_NOT_FOUND',
        message: 'Study plan not found'
      });
    }

    return res.json({
      success: true,
      message: 'Study plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting plan:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to delete plan'
    });
  }
});

export default router;