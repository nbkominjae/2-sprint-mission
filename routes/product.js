import express from 'express';
import { db } from '../utils/db.js';
import { assert } from 'superstruct';
import { createDto} from '../dtos/product.dto.js';

const router = express.Router();


// 상품 상세조회 API

router.get('/detail/:id', async function(req,res,next){
  try{
  const id = Number(req.params.id)
  const product = await db.product.findUnique({
    where: {id : id}
  })
  if(!product){
    return res.status(404).json({ message : '없는 상품입니다.'})
  }
  res.json(product);

  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
  
});

// 상품 목록 조회 API 

router.get('/list', async function (req,res,next) {
  try{
  const {name = '' , description = ''} = req.query;

  const product = await db.product.findMany({
    where:{
      OR: [
        {name : {contains : name  , mode : 'insensitive'}},
        {description : {contains : description, mode : 'insensitive'}}
      ]    
    },
    select : {
      id : true,
      name : true,
      price : true,
      createdAt : true
    },
    orderBy : {createdAt : 'desc' },
    skip : 0,
    take : 10
  })
  res.send(product);

  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});


// 상품 등록 API

router.post('/create', async function(req,res,next) {
  console.log('req.body:', req.body);
  assert( req.body , createDto);

  try{
  const {name, description, price, tags} = req.body;
  
  const product = await db.product.create({
    data : {name, description, price, tags}
  })
  res.json({product})

  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});

//  상품 수정 API 

router.patch('/change/:id', async function (req,res,next ) {
  try{
  const id = Number(req.params.id);
  const data = req.body;
  const updatedData = await db.product.update({
    where: { id : id},
    data : {
      ...data
    }
  })
  res.json(updatedData);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
});

// 상품 삭제 API 

router.delete('/remove/:id', async function (req,res,next){
  try{
  const id = Number(req.params.id);
  const deleteProduct = await db.product.delete({
    where : {id : id}
  })
  res.json(deleteProduct);
  }catch(err){
    console.log(err);
    res.status(500).json({message :'서버에러'});
  }
}) 

export default router;

