import express from 'express';
import { db } from '../utils/db.js';
import { assert } from 'superstruct';
import { createDto } from '../dtos/product.dto.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// 상품 상세조회 API

router.get('/detail/:id', async function (req, res, next) {
  try {
    const id = Number(req.params.id)
    const product = await db.product.findUnique({
      where: { id: id }
    })
    if (!product) {
      return res.status(404).json({ message: '없는 상품입니다.' })
    }
    res.json(product);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }

});

// 상품 목록 조회 API 

router.get('/list', async function (req, res, next) {
  try {
    const { name = '', description = '', offset = 0, limit = 10, order = 'newest' } = req.query;
    let orderBy;
    switch (order) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    const product = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: name, mode: 'insensitive' } },
          { description: { contains: description, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true
      },
      orderBy,
      skip: parseInt(offset),
      take: parseInt(limit),
    })
    res.send(product);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 상품 등록 API assert로 유효성검증, authenticate로 인증 

router.post('/create', authenticate, async function (req, res, next) {
  try {
    assert(req.body, createDto);
    const { name, description, price, tags } = req.body;
    const user = req.user;

    const product = await db.product.create({
      data: { userId: user.id, name, description, price, tags }
    })
    res.json({ product })

  } catch (err) {
    if (err.name === "StructError") {
      return res.status(400).json({ message: "유효성검증에러" })
    }

    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

//  상품 수정 API : 로그인된 유저, 본인 상품만 수정 가능  

router.patch('/change/:id', authenticate, async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const user = req.user;

    const product = await db.product.findUnique({
      where: { id: id },
    });
    if (!product) {
      return res.status(404).json({ message: "등록되지 않은 상품입니다." });
    }
    if (product.userId !== user.id) {
      return res.status(401).json({ message: '유저 권한이 없습니다.' })
    }

    const updatedData = await db.product.update({
      where: { id: id },
      data: data,
    });

    res.json(updatedData);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
});

// 상품 삭제 API : 로그인된 유저, 본인 상품만 삭제 가능 

router.delete('/remove/:id', authenticate, async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = req.user;
    const product = await db.product.findUnique({
      where: { id: id },
    });
    if (!product) {
      return res.status(404).json({ message: "등록되지 않은 상품입니다." })
    }
    if (product.userId !== user.id) {
      return res.status(401).json({ message: "권한 없는 유저입니다." })
    }
    const deleteProduct = await db.product.delete({
      where: { id: id }
    })
    res.json(deleteProduct);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '서버에러' });
  }
})

// 로그인한 유저의 상품 좋아요 기능 

router.post('/likes/:productId', authenticate, async function (req, res, next) {
  const productId = Number(req.params.productId);
  const product = await db.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }
  const productLike = await db.product.update({
    where: { id: productId },
    data: {
      likeCount: { increment: 1 }
    }
  });
  return res.json({ likeCount: productLike.likeCount });

});

// 로그인한 유저의 상품 좋아요 취소
router.delete('/likesCancel/:productId', authenticate, async function (req, res, next) {
  const productId = Number(req.params.productId);
  const product = await db.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }
  if (product.likeCount > 0) {
    const productLikeCancel = await db.product.update({
      where: { id: productId },
      data: {
        likeCount: { decrement: 1 }
      }
    });
    return res.json({ likeCount: productLikeCancel.likeCount });
  } else {
    return res.status(400).json({ message: '좋아요는 0보다 작아질 수 없습니다.' });
  }
});

export default router;

