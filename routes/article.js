import express from "express";
import { db } from '../utils/db.js';
import { articleDto } from '../dtos/article.dto.js';
import { assert } from 'superstruct';
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

// 게시글 상세 조회 API

router.get('/detail/:id', async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const detailArticle = await db.article.findUnique({
      where: { id: id }
    });
    if (!detailArticle) {
      return res.status(404).json({ message: '없는 게시물입니다.' })

    }
    res.json(detailArticle);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 게시글 목록 조회 API 

router.get('/list', async function (req, res, next) {
  try {
    const { title = '', content = '', offset = 0, limit = 10, order = "newest" } = req.query;
    let orderBy;
    switch (order) {
      case 'newest':
        orderBy = { createdAt: "desc" }
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break;
      default:
        orderBy = { createdAt: 'desc' }
    }
    const article = await db.article.findMany({
      where: {
        OR: [
          { title: { contains: title, mode: 'insensitive' } },
          { content: { contains: content, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true
      },
      orderBy,
      skip: parseInt(offset),
      take: parseInt(limit),
    });
    res.json(article);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 게시물 등록 API assert , authenticate로 유저 인증 
router.post('/create', authenticate, async function (req, res, next) {

  try {
    assert(req.body, articleDto);
    const { title, content } = req.body;
    const user = req.user;
    const article = await db.article.create({
      data: { userId: user.id, title, content }
    });
    res.json(article);
  } catch (err) {
    if (err.name === 'StructError') {
      return res.status(400).json({ message: "유효성검증에러" })
    }
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 게시글 수정: 로그인된 유저, 본인 게시물만 수정 가능  

router.patch('/change/:id', authenticate, async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const user = req.user;

    const article = await db.article.findUnique({
      where: { id: id }
    });
    if (!article) {
      return res.status(404).json({ message: '없는 게시물입니다.' });
    }
    if (article.userId !== user.id) {
      return res.status(401).json({ message: '권한 없는 유저입니다.' });
    }
    const updatedArticle = await db.article.update({
      where: { id: id },
      data: data
    });
    res.json(updatedArticle);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 게시글 삭제: 로그인된 유저, 본인 게시물만 삭제 가능  

router.delete('/remove/:id', authenticate, async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = req.user;
    const article = await db.article.findUnique({
      where: { id: id }
    })
    if(!article){
      return res.status(404).json({message : "없는 게시물입니다."})
    }
    if(article.userId !== user.id){
      return res.status(401).json({message : "권한이 없습니다."})
    }
    const deleteArticle = await db.article.delete({
      where: { id: id }
    })
    res.json(deleteArticle);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 로그인 한 유저의 게시글 좋아요 추가

router.post('/likes/:articleId', authenticate, async function (req, res, next) {
  const articleId = Number(req.params.articleId);
  const article = await db.article.findUnique({
    where: { id: articleId },
  });
  if (!article) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }
  const articleLike = await db.article.update({
    where: { id: articleId },
    data: {
      likeCount: { increment: 1 }
    }
  });
  return res.json({ likeCount: articleLike.likeCount });

});

// 로그인 한 유저의 게시글 좋아요 취소 

router.delete('/likesCancel/:articleId', authenticate, async function (req, res, next) {
  const articleId = Number(req.params.articleId);
  const article = await db.article.findUnique({
    where: { id: articleId },
  });
  if (!article) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }
  if (article.likeCount > 0) {
    const articleLikeCancel = await db.article.update({
      where: { id: articleId },
      data: {
        likeCount: { decrement: 1 }
      }
    });
    return res.json({ likeCount: articleLikeCancel.likeCount });
  } else {
    return res.status(400).json({ message: '좋아요는 0보다 작아질 수 없습니다.' });
  }
});

export default router;