var createError = require('http-errors');
var express = require('express');


var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


//  route import

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/product');
var articleRouter = require('./routes/article');
var commentRouter = require('./routes/comment');
var imageRouter = require('./routes/image');
var app = express();



// public 폴더 안 uploads.html 파일 브라우저 접속가능
// http://localhost:3000/uploads.html

app.use(express.static(path.join(__dirname, 'public')));

// 업로드 한 파일 보기
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(logger('dev'));
app.use(express.json());


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//  route 사용 

app.use('/', indexRouter);
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
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
