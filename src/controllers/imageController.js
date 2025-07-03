import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
};

const upload = multer({ dest: 'uploads/'});

router.post('/upload', upload.single('attachment'),(req,res) => {
  if(!req.file){
    return res.status(404).json({message : "파일 없음"});
  }
  const filename = req.file.filename;
  const fileUrl = `/upload/${filename}`;

  res.json({
    message : '파일 업로드', 
    filename: req.file.filename,
    url : fileUrl, 
  });
});

export default router;