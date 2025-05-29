import express from "express";
import { db }  from '../utils/db.js';
import { articleDto } from '../dtos/article.dto.js';
import { assert } from 'superstruct';

const router = express.Router();


// 게시글 상세 조회 API

router.get('/detail/:id' , async function(req,res,next){
  try{
  const id = Number(req.params.id);
  const detailArticle = await db.article.findUnique({
    where : {id : id}
  });
  if(!detailArticle){
    return res.status(404).json({message : '없는 게시물입니다.'})
    
  }
  res.json(detailArticle);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});

// 게시글 목록 조회 API 

router.get('/list', async function(req,res,next){
  try{
  const { title = '' , content = '' , offset = 0 , limit = 10 , order = "newest"} = req.query; 
  let orderBy;
  switch (order){
    case 'newest' :
      orderBy = {createdAt : "desc"}
      break;
    case 'oldest' :
      orderBy = {createdAt : 'asc'}
      break;
    default :
      orderBy = {createdAt : 'desc'}
  }
  const article = await db.article.findMany({
    where: {
      OR : [
        {title : {contains : title , mode : 'insensitive'}},
        {content : {contains : content , mode : 'insensitive'}}
      ]
    },
    select : {
      id : true,
      title : true,
      content : true,
      createdAt : true
    },
    orderBy,
    skip : parseInt(offset),
    take : parseInt(limit),
  });
  res.json(article);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});


// 게시물 등록 API assert사용
router.post('/create', async function (req,res,next) {
  
  try{
  assert (req.body , articleDto);
  const {title , content} = req.body;
  const article = await db.article.create ({
    data : {title , content}
  });
  res.json(article);
  }catch(err){
    if(err.name === 'StructError'){
      return res.status(400).json({message : "유효성검증에러"})
    }
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});


// 게시글 수정 API

router.patch('/change/:id', async function(req,res,next){
  try{
  const id = Number(req.params.id);
  const data = req.body;
  const updatedArticle = await db.article.update({
    where : { id : id},
    data: {
      ...data
    }
  });
  res.json(updatedArticle);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});

// 게시글 삭제 API

router.delete('/remove/:id', async function(req,res,next){
  try{
  const id = Number(req.params.id);
  const deleteArticle = await db.article.delete({
    where:{id : id}
  })
  res.json(deleteArticle);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});

export default router;