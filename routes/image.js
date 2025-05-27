var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var { db } = require('../utils/db');

const uploadDir = path.join(__dirname,'..', 'uploads');

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

module.exports = router;