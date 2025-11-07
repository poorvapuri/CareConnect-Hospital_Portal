import multer from 'multer';
import { uploadPDF } from '../config/cloudinary.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadLabReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadPDF(req.file.buffer.toString('base64'));
    req.reportUrl = result.secure_url;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default upload;