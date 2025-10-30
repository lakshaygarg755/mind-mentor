import CuratedResource from '../models/curatedResource.js';
import StudyPlan from '../models/studyPlan.js';

async function saveResources(userId, subject, curatedData) {
  try {
    const resources = curatedData.resources.map(resource => ({
      title: resource.title,
      link: resource.url,
      type: 'website',
      description: resource.description,
      benefits: resource.benefits
    }));

    const newResource = new CuratedResource({
      userId,
      topic: subject,
      resources,
      lastUpdated: new Date()
    });

    await newResource.save();
    return newResource;
  } catch (error) {
    console.error('Error saving resources:', error);
    throw error;
  }
}

async function savePlan(userId, planData) {
  try {
    const newPlan = new StudyPlan({
      userId,
      overview: planData.overview,
      weeklyPlans: planData.weeklyPlans,
      recommendations: planData.recommendations,
      isActive: true,
      progress: 0,
      lastUpdated: new Date()
    });

    await newPlan.save();
    return newPlan;
  } catch (error) {
    console.error('Error saving plan:', error);
    throw error;
  }
}

export { saveResources, savePlan };