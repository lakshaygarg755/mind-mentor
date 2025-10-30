import mongoose, { Schema } from "mongoose";

const resourceSchema = new Schema({
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
    default: 'website' // Default type
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

const curatedResourceSchema = new Schema({
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

const CuratedResource = mongoose.models.CuratedResource || mongoose.model("CuratedResource", curatedResourceSchema);

export default CuratedResource; 