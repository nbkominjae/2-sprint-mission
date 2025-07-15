import express from 'express';
import multer from 'multer';
import UploadController from '../controllers/image-controller';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('attachment'), UploadController.uploadFile.bind(UploadController));

export default router;
