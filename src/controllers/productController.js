// src/controllers/ProductController.js
import { db } from '../lib/db.js';
import { assert } from 'superstruct';
import { productDto } from '../dtos/product.dto.js';

class ProductController {
  async getDetail(req, res) {
    try {
      const id = Number(req.params.id);
      const product = await db.product.findUnique({ where: { id } });
      if (!product) {
        return res.status(404).json({ message: '없는 상품입니다.' });
      }
      res.json(product);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }

  async getList(req, res) {
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
      });
      res.json(product);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }

  async create(req, res) {
    try {
      assert(req.body, productDto);
      const { name, description, price, tags } = req.body;
      const user = req.user;
      const product = await db.product.create({
        data: { userId: user.id, name, description, price, tags }
      });
      res.json({ product });
    } catch (err) {
      if (err.name === "StructError") {
        return res.status(400).json({ message: "유효성검증에러" });
      }
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }

  async change(req, res) {
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const user = req.user;

      const product = await db.product.findUnique({ where: { id } });
      if (!product) {
        return res.status(404).json({ message: "존재하지 않는 상품입니다." });
      }
      if (product.userId !== user.id) {
        return res.status(401).json({ message: '본인이 등록한 상품이 아닙니다.' });
      }

      const updatedData = await db.product.update({
        where: { id },
        data,
      });
      res.json(updatedData);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }

  async remove(req, res) {
    try {
      const id = Number(req.params.id);
      const user = req.user;
      const product = await db.product.findUnique({ where: { id } });
      if (!product) {
        return res.status(404).json({ message: "존재하지 않는 상품입니다." });
      }
      if (product.userId !== user.id) {
        return res.status(401).json({ message: "권한 없는 유저입니다." });
      }
      const deleteProduct = await db.product.delete({ where: { id } });
      res.json(deleteProduct);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }

  async like(req, res) {
    try {
      const productId = Number(req.params.productId);
      const userId = req.user.id;

      const product = await db.product.findUnique({ where: { id: productId } });
      if (!product) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      const alreadyLike = await db.productLike.findUnique({
        where: { userId_productId: { userId, productId } }
      });

      if (alreadyLike) {
        return res.status(409).json({ message: '이미 좋아요를 누르셨습니다.' });
      }

      const productLike = await db.productLike.create({
        data: { userId, productId }
      });
      res.json(productLike);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }

  async likeCancel(req, res) {
    try {
      const productId = Number(req.params.productId);
      const userId = req.user.id;

      const product = await db.product.findUnique({ where: { id: productId } });
      if (!product) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      const existLike = await db.productLike.findUnique({
        where: { userId_productId: { userId, productId } }
      });

      if (!existLike) {
        return res.status(404).json({ message: '좋아요를 누른 적이 없습니다.' });
      }

      const removeLike = await db.productLike.delete({
        where: { userId_productId: { userId, productId } }
      });
      res.json(removeLike);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }

  async likesList(req, res) {
    try {
      const user = req.user;
      const likeProduct = await db.productLike.findMany({
        where: { userId: user.id },
        select: { productId: true }
      });
      const likeProductIds = likeProduct.map(lp => lp.productId);
      const products = await db.product.findMany({
        where: { id: { in: likeProductIds } },
        select: { id: true, name: true, price: true, createdAt: true }
      });
      res.json(products);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }

  async isLiked(req, res) {
    try {
      const user = req.user;
      const productLikes = await db.productLike.findMany({
        where: { userId: user.id },
        select: { productId: true },
      });
      const likedProductIds = productLikes.map(pl => pl.productId);

      const allProducts = await db.product.findMany({
        select: {
          id: true, name: true, description: true, price: true, tags: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const productListWithLikes = allProducts.map(product => ({
        ...product,
        isLiked: likedProductIds.includes(product.id),
      }));
      res.status(200).json(productListWithLikes);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '서버에러' });
    }
  }
}

export default new ProductController();
