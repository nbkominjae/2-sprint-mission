var express = require('express');
const { db } = require('../utils/db');
var router = express.Router();


// 상품 상세조회 API
router.get('/list/:id', async function(req,res,next){
  const id = Number(req.params.id)
  const product = await db.product.findUnique({
    where: {id : id}
  });
  res.json(product);
});


// 상품 등록 API

router.post('/create', async function(req,res,next) {
  const {name, description, price, tags} = req.body;
  
  const product = await db.product.create({
    data : {name, description, price, tags}
  })
  res.json({id : product.id})
});

//  상품 수정 API 

router.patch('/product/:id', async function (req,res,next ) {
  const id = Number(req.params.id);
  const data = req.body;
  
  const change = {
    data.id : 312,
    data.name : 'sdas',
 
  }
  
})


module.exports = router;

