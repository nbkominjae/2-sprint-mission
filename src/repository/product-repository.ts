import { db } from '../utils/db';

export const productRepository = {
  findById: (id: number) => db.product.findUnique({ where: { id } }),
  findManyWithFilter: (query: any) => db.product.findMany(query),
  create: (data: any) => db.product.create({ data }),
  update: (id: number, data: any) => db.product.update({ where: { id }, data }),
  delete: (id: number) => db.product.delete({ where: { id } }),

  // 좋아요 관련
  findProductLike: (userId: number, productId: number) => db.productLike.findUnique({
    where: { userId_productId: { userId, productId } }
  }),
  createProductLike: (userId: number, productId: number) => db.productLike.create({
    data: { userId, productId }
  }),
  deleteProductLike: (userId: number, productId: number) => db.productLike.delete({
    where: { userId_productId: { userId, productId } }
  }),
  findUserLikes: (userId: number) => db.productLike.findMany({
    where: { userId },
    select: { productId: true }
  }),
  findProductsByIds: (ids: number[]) => db.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, price: true, createdAt: true }
  }),
  findAllProducts: () => db.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      tags: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' }
  }),
};
