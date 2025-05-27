var express = require('express');
var { db } = require('../utils/db');
var router = express.Router();


// 중고마켓 댓글 등록 API 

router.post('/product/create', async function(req,res,next){
  try{
  const { content , product_id } = req.body;
  const product = await db.product.findUnique({
    where: {id : product_id}
  });
  if(!product){
    return res.status(404).json({message : '없는 제품입니다.'})
  }
  const productComments = await db.comment.create({
    data : {
      product_id,
      content,
    }
  })
  res.json({ productComments });
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});



// 자유게시판 댓글 등록 API
router.post('/article/create', async function(req,res,next){
  try{
  const { article_id , content } = req.body;
  const article = await db.article.findUnique({
    where : { id : article_id}
  });
  if(!article){
    return res.status(404).json({message : '없는 게시판입니다.'})
  }
  const articleComments = await db.comment.create({
    data :{
      article_id,
      content,
    }
  })
  res.json(articleComments);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});


// 댓글 수정 API 

router.patch('/change/:id', async function(req,res,next){
  try{
  const id = Number(req.params.id);
  const data = req.body;
  const updateComment = await db.comment.update({
    where:{id : id},
    data : {
      ...data
    }
  })
  res.json(updateComment);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});

// 댓글 삭제 API

router.delete('/remove/:id', async function(req,res,next){
  try{
  const id = Number(req.params.id);
  const deleteComment = await db.comment.delete({
    where: { id : id}
  })
  res.json(deleteComment);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});


// 중고마켓 댓글 목록 조회 API
router.get('/product/list/:product_id', async function(req,res,next){
  try{
  const product_id = Number(req.params.product_id)
  const pdCommentList = await db.comment.findMany({
    where : {product_id : product_id},
    select : {
      id : true,
      content : true,
      createdAt : true,
    }
  })
  res.json(pdCommentList);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});

// 자유게시판 댓글 목록 조회 API 

router.get('/article/list/:article_id', async function(req,res,next){
  try{
  const article_id = Number(req.params.article_id);
  const artCommentList = await db.comment.findMany({
    where : { article_id : article_id},
    select : {
      id : true,
      content : true,
      createdAt : true,
    },
    take : 10,
    skip : 0,
    cursor: { id : 1 },
    orderBy : {id : 'asc'}

  })
  res.json(artCommentList);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});



