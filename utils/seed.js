const { db } = require('./db');

async function seed() {

  
  await db.product.create({
    data:{
      name : '예시제품이름',
      description : 'seeding',
      price : 50000,     
      tags : ['전자제품'],
      comments: {
        create:{
          content: '상품댓글'
        }
      }
    }    
  })
  await db.article.create({
    data:{
      title : '제목',
      content: '내용',
      comments : {
        create: {
          content : "자유게시판댓글"
        }
      }     
    }
  }) 
};

seed()