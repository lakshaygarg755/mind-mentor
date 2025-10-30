import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: 'website'
  },
  description: {
    type: String,
    required: true,
  },
  benefits: [{
    type: String,
    required: true,
  }],
});

const curatedResourceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  resources: [resourceSchema],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('CuratedResource', curatedResourceSchema); 