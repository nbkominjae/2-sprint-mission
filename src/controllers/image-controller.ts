import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');

// uploads 폴더 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

class UploadController {
  uploadFile(req, res) {
    if (!req.file) {
      return res.status(404).json({ message: "파일 없음" });
    }

    const filename = req.file.filename;
    const fileUrl = `/upload/${filename}`;

    res.json({
      message: '파일 업로드 성공',
      filename,
      url: fileUrl,
    });
  }
}

export default new UploadController();
