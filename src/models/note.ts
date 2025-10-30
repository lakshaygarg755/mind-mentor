import mongoose from "mongoose";

// For nested blocks/content structure like Notion
const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['paragraph', 'heading1', 'heading2', 'heading3', 'bulletList', 'numberedList', 'todo', 'code'],
    default: 'paragraph'
  },
  content: String,
  checked: { type: Boolean, default: false }, // for todo items
}, { timestamps: true });

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled'
  },
  content: [blockSchema],
  icon: String,
  cover: String,
  isArchived: {
    type: Boolean,
    default: false
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    default: null
  },
  path: {
    type: String,
    default: '/'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
noteSchema.index({ userId: 1, path: 1 });
noteSchema.index({ userId: 1, parentId: 1 });

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);

export default Note; 