import mongoose from 'mongoose';

const pdfDocumentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  pdfData: {
    type: String, // Base64 encoded PDF data
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  documentChunks: [{
    text: String,
    metadata: {
      pageNumber: Number,
      location: String
    }
  }],
  chatHistory: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    sourcePages: [{
      type: Number
    }],
    sources: [{
      page: {
        type: Number,
        required: true
      },
      content: {
        type: String,
        required: true
      }
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
pdfDocumentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes
pdfDocumentSchema.index({ userId: 1, createdAt: -1 });
pdfDocumentSchema.index({ userId: 1, title: 1 });

const PdfDocument = mongoose.models.PdfDocument || mongoose.model('PdfDocument', pdfDocumentSchema);

export default PdfDocument; 