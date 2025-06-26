import express from "express";
import { db } from '../utils/db.js';
import authenticate from "../middlewares/authenticate.js";
import { date } from "superstruct";

const router = express.Router();


// 중고마켓 댓글 등록 API 로그인 필수

router.post('/product/create', authenticate, async function (req, res, next) {
  try {
    const { content, product_id } = req.body;
    const user = req.user;

    const product = await db.product.findUnique({
      where: { id: product_id }
    });
    if (!product) {
      return res.status(404).json({ message: '없는 제품입니다.' })
    }

    const productComments = await db.comment.create({
      data: {
        userId: user.id,
        product_id,
        content,
      }
    });
    res.json({ productComments });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});



// 자유게시판 댓글 등록 API 로그인 필수 
router.post('/article/create', authenticate, async function (req, res, next) {
  try {
    const { article_id, content } = req.body;
    const user = req.user;

    const article = await db.article.findUnique({
      where: { id: article_id }
    });
    if (!article) {
      return res.status(404).json({ message: '없는 게시판입니다.' })
    }
    const articleComments = await db.comment.create({
      data: {
        userId: user.id,
        article_id,
        content,
      }
    })
    res.json({ articleComments });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});


// 댓글 수정 API : 로그인된 유저, 본인 댓글만 수정 가능  

router.patch('/change/:id', authenticate, async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;
    const user = req.user;
    const comment = await db.comment.findUnique({
      where: { id: id }
    });
    if (!comment) {
      return res.status(404).json({ message: '없는 댓글입니다.' });
    }
    if (comment.userId !== user.id) {
      return res.status(401).json({ message: '없는 권한입니다.' });
    }

    const updatedComment = await db.comment.update({
      where: { id: id },
      data: { content }
    })
    return res.json(updatedComment);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 댓글 삭제 API : 로그인된 유저, 본인 댓글만 삭제 가능  

router.delete('/remove/:id', authenticate, async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = req.user;
    const comment = await db.comment.findUnique({
      where : { id : id },
    });
    if(!comment){
      return res.status(404).json({ message : '없는 댓글입니다.'})
    }
    if(comment.userId !== user.id){
      return res.status(401).json({ message : '권한이 없습니다.'})
    };
    const deleteComment = await db.comment.delete({
      where: { id: id }
    })
    res.json(deleteComment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});


// 중고마켓 댓글 목록 조회 API
router.get('/product/list/:product_id', async function (req, res, next) {
  try {
    const product_id = Number(req.params.product_id)
    const pdCommentList = await db.comment.findMany({
      where: { product_id: product_id },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
      take: 10,
      skip: 0,
      cursor: { id: 1 },
      orderBy: { id: 'asc' }
    })
    if (pdCommentList.length === 0) {
      return res.status(404).json({ message: '댓글을 찾지 못했습니다.' })
    }
    res.json(pdCommentList);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 자유게시판 댓글 목록 조회 API 

router.get('/article/list/:article_id', async function (req, res, next) {
  try {
    const article_id = Number(req.params.article_id);
    const artCommentList = await db.comment.findMany({
      where: { article_id: article_id },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
      take: 10,
      skip: 0,
      cursor: { id: 1 },
      orderBy: { id: 'asc' }
    })
    if (artCommentList.length === 0) {
      return res.status(404).json({ message: '댓글을 찾지 못했습니다.' });
    }
    res.json(artCommentList);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});


export default router;
