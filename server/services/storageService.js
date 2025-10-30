import multer from 'multer';

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check both mimetype and file extension
    const isPDF = file.mimetype === 'application/pdf' && 
                  file.originalname.toLowerCase().endsWith('.pdf');
    
    if (isPDF) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow one file per request
  }
});

// Convert file buffer to Base64
export function bufferToBase64(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer');
  }
  return `data:application/pdf;base64,${buffer.toString('base64')}`;
}

// Convert Base64 to buffer with validation
export function base64ToBuffer(base64String) {
  try {
    if (typeof base64String !== 'string') {
      throw new Error('Invalid input type');
    }
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Validate that it's a valid base64 string
    if (buffer.toString('base64') !== base64Data) {
      throw new Error('Invalid base64 string');
    }
    
    return buffer;
  } catch (error) {
    console.error('Error converting base64 to buffer:', error);
    throw new Error('Invalid base64 data');
  }
} 