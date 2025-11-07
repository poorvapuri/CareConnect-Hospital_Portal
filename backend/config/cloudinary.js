import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadPDF = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'raw',
      folder: 'lab_reports',
      format: 'pdf'
    });
    return result;
  } catch (error) {
    throw new Error('PDF upload failed: ' + error.message);
  }
};

export default cloudinary;