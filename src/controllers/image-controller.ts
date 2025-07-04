import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

const uploadDir = path.join(process.cwd(), 'uploads');

// uploads 폴더 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

class UploadController {
  uploadFile(req: Request, res: Response): void {
    if (!req.file) {
      res.status(400).json({ message: "파일 없음" });
      return;
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

