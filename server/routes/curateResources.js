import express from 'express';
import { searchTavily, curateResources } from '../services/aiService.js';
import CuratedResource from '../models/curatedResource.js';

const router = express.Router();

// Get resources for a user
router.get('/:userId', async (req, res) => { 
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const resources = await CuratedResource.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      resources 
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch resources' 
    });
  }
});

// Create new resources
router.post('/', async (req, res) => {
  try {
    const { subject, userId } = req.body;

    if (!subject?.trim() || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'INVALID_INPUT',
        message: 'Subject and userId are required' 
      });
    }

    // Normalize the subject string
    const normalizedSubject = subject.trim().toLowerCase().replace(/\s+/g, ' ');

    // Check for existing resources with case-insensitive matching
    const existingResources = await CuratedResource.findOne({
      userId,
      topic: { $regex: new RegExp(`^${normalizedSubject}$`, 'i') }
    });

    if (existingResources) {
      return res.status(400).json({
        success: false,
        error: 'RESOURCE_EXISTS',
        message: `You already have curated resources for "${subject}". Please check your existing resources.`
      });
    }

    // If no existing resources, generate new ones
    const searchData = await searchTavily(subject);
    
    if (!searchData || !searchData.results) {
      return res.status(500).json({
        success: false,
        error: 'SEARCH_FAILED',
        message: 'Failed to search for resources. Please try again.'
      });
    }

    const curatedData = await curateResources(searchData, subject);
    
    if (!curatedData || !curatedData.resources) {
      return res.status(500).json({
        success: false,
        error: 'CURATION_FAILED',
        message: 'Failed to curate resources. Please try again.'
      });
    }

    // Validate and transform resources to match schema
    const validatedResources = curatedData.resources.map(resource => ({
      title: resource.title || 'Untitled Resource',
      link: resource.url || '#', // Map url to link
      type: resource.format || 'website',
      description: resource.description || 'No description available',
      benefits: resource.benefits || ['Resource for learning ' + subject]
    }));

    // Create new resource document
    const newResource = new CuratedResource({
      userId,
      topic: normalizedSubject, // Use topic instead of subject
      resources: validatedResources,
      lastUpdated: new Date()
    });

    const savedResource = await newResource.save();

    return res.json({
      success: true,
      message: 'Resources curated successfully',
      resources: savedResource
    });

  } catch (error) {
    console.error('Error in resource curation:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'An error occurred while curating resources. Please try again.'
    });
  }
});

// Delete a resource
router.delete('/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'resourceId is required'
      });
    }

    // Find and delete the resource
    const deletedResource = await CuratedResource.findByIdAndDelete(resourceId);
    
    if (!deletedResource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resource'
    });
  }
});

export default router;