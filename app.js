import createError from 'http-errors';
import express from 'express';

import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import usersRouter from './routes/users.js';
import productRouter from './routes/product.js';
import articleRouter from './routes/article.js';
import commentRouter from './routes/comment.js';
import imageRouter from './routes/image.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());

// public 폴더 안 uploads.html 파일 브라우저 접속가능
// http://localhost:3000/uploads.html
app.use(express.static(path.join(__dirname, 'public')));

// 업로드 한 파일 보기
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// route 사용
app.use('/users', usersRouter);
app.use('/product', productRouter);
app.use('/article', articleRouter);
app.use('/comment', commentRouter);
app.use('/image', imageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
  });
});

export default app;




