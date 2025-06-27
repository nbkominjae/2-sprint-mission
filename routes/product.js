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

// 상품 등록 API assert로 유효성검증, authenticate로 로그인한 유저만 등록가능  

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

//  상품 수정 API : 로그인된 유저, 본인 상품만 수정 가능  상품아이디params

router.patch('/change/:id', authenticate, async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const user = req.user;

    const product = await db.product.findUnique({
      where: { id: id },
    });
    if (!product) {
      return res.status(404).json({ message: "존재하지 않는 상품입니다." });
    }
    if (product.userId !== user.id) {
      return res.status(401).json({ message: '본인이 등록한 상품이 아닙니다.' })
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

// 상품 삭제 API : 로그인된 유저, 본인 상품만 삭제 가능  상품아이디params

router.delete('/remove/:id', authenticate, async function (req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = req.user;
    const product = await db.product.findUnique({
      where: { id: id },
    });
    if (!product) {
      return res.status(404).json({ message: "존재하지 않는 상품입니다." })
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
  const userId = req.user.id;
  const product = await db.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }
  const alreadyLike = await db.productLike.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (alreadyLike) {
    return res.status(409).json({ message: '이미 좋아요를 누르셨습니다.' });
  }
  const productLike = await db.productLike.create({
    data: {
      userId,
      productId,
    }
  });
  return res.json(productLike);

});

// 로그인한 유저의 상품 좋아요 취소
router.delete('/likesCancel/:productId', authenticate, async function (req, res, next) {
  const productId = Number(req.params.productId);
  const userId = req.user.id;

  const product = await db.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
  }
  const existLike = await db.productLike.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  })

  if (existLike) {
    const removeLike = await db.productLike.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })
    return res.json(removeLike)
  }
  return res.status(404).json({ message: '좋아요를 누른 적이 없습니다.' });


});


// 유저가 좋아요한 상품 목록 조회 
router.get('/likesList', authenticate, async function (req, res, next) {
  const user = req.user;
  const likeProduct = await db.productLike.findMany({
    where: { userId: user.id },
    select: {
      productId: true
    }
  })
  const likeProductIds = likeProduct.map(lp => lp.productId)
  const products = await db.product.findMany({
    where: {
      id: { in: likeProductIds }
    },
    select: {
      id: true,
      name: true,
      price: true,
      createdAt: true
      // 필요한 필드 추가 가능
    }
  });
  res.json(products);
})

// 상품 목록조회할 때 좋아요 누른 제품인지 확인 필드 isLiked

router.get('/isLiked', authenticate, async function (req, res, next) {
  const user = req.user;
  const product = await db.productLike.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });

  const likedProductIds = product.map((like) => like.productId);

  const allProducts = await db.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc', // 필요에 따라 정렬
    },
  });
  const productListWithLikes = allProducts.map((product) => ({
    ...product,
    isLiked: likedProductIds.includes(product.id),
  }));
  return res.status(200).json(productListWithLikes);
});



export default router;

