const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, extOk);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// POST /api/upload - Image upload for Quill editor to Supabase Storage
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const fileExt = path.extname(req.file.originalname);
    const fileName = `img-${Date.now()}-${Math.round(Math.random() * 1e6)}${fileExt}`;

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      return res.status(500).json({ error: 'Failed to upload to Supabase' });
    }

    const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);

    res.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

module.exports = router;
