import express from 'express';
import multer from 'multer';
import UploadController from '../controllers/UploadController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('attachment'), (req, res) =>
  UploadController.uploadFile(req, res)
);

export default router;
