const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const router = express.Router();

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      console.log("▶️ File received:", req.file); // Add this line
  
      if (!req.file) {
        console.log("❌ No file in request");
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'your_folder_name',
              resource_type: 'auto'
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
  
      const result = await streamUpload(req);
      console.log("✅ Uploaded to Cloudinary:", result); // Add this line
  
      res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl: result.secure_url
      });
    } catch (error) {
      console.error("❌ Upload Error:", error); // Add this line
      res.status(500).json({ message: 'Upload failed', error });
    }
  });
  
module.exports = router;
