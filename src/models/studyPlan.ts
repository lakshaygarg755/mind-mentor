import mongoose from "mongoose";

// Match the exact structure from AI response
const dailyTaskSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  tasks: [String],
  duration: {
    type: String,
    required: true
  }
});

const weeklyPlanSchema = new mongoose.Schema({
  week: {
    type: String,
    required: true
  },
  goals: [String],
  dailyTasks: [dailyTaskSchema]
});

const overviewSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  examDate: {
    type: String,
    required: true
  }
});

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  overview: {
    type: overviewSchema,
    required: true
  },
  weeklyPlans: [weeklyPlanSchema],
  recommendations: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  progress: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add compound index for efficient querying
studyPlanSchema.index({ userId: 1, isActive: 1 });
studyPlanSchema.index({ userId: 1, 'overview.subject': 1 });

const StudyPlan = mongoose.models.StudyPlan || mongoose.model('StudyPlan', studyPlanSchema);

export default StudyPlan;