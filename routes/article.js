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
      return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });
    }
    if (article.userId !== user.id) {
      return res.status(401).json({ message: '본인이 등록한 게시글이 아닙니다.' });
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
    if (!article) {
      return res.status(404).json({ message: "존재하지 않는 게시물입니다." })
    }
    if (article.userId !== user.id) {
      return res.status(401).json({ message: "본인이 등록한 게시글이 아닙니다." })
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
  const userId = req.user.id;
  const article = await db.article.findUnique({
    where: { id: articleId },
  });
  if (!article) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }
  const alreadyLike = await db.articleLike.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId
      }
    }
  });

  if (alreadyLike) {
    return res.status(409).json({ message: '이미 좋아요를 누르셨습니다.' });
  }
  const articleLike = await db.articleLike.create({
    data: {
      userId,
      articleId,
    }
  });


  return res.json(articleLike);

});

// 로그인 한 유저의 게시글 좋아요 취소 

router.delete('/likesCancel/:articleId', authenticate, async function (req, res, next) {
  const articleId = Number(req.params.articleId);
  const userId = req.user.id;

  const article = await db.article.findUnique({
    where: { id: articleId },
  });
  if (!article) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }
  const existLike = await db.articleLike.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId
      }
    }
  });

  if (existLike) {
    const removeLike = await db.articleLike.delete({
      where: {
        userId_articleId: {
          userId,
          articleId
        }
      }
    });
    return res.json(removeLike)
  }
  return res.status(404).json({ message: '좋아요를 누른 적이 없습니다.' });

});

// 유저가 좋아요 눌렀는지 안눌렀는지 나오는 게시글 목록 조회

router.get('/isLiked', authenticate, async function (req, res, next) {
  const user = req.user;
  const article = await db.articleLike.findMany({
    where: { userId: user.id },
    select: { articleId: true }
  });
  const articleLikeIds = article.map((like) => like.articleId );
  const allProducts = await db.article.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
    orderBy: {
      createdAt: 'desc', // 필요에 따라 정렬
    },
  });
  const articleListWithLikes = allProducts.map((article) => ({
    ...article,
    isLiked: articleLikeIds.includes(article.id),
  }));
  return res.status(200).json(articleListWithLikes);
});

export default router;