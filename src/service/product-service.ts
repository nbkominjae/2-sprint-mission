import { productRepository } from '../repository/product-repository';
import { getListProductQuery } from '../types/query';

export const productService = {
  async getDetail(id: number) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('NOT_FOUND');
    return product;
  },

  async getList(query: getListProductQuery) {
    const { name = '', description = '', order = 'newest' } = query;
    const offset = Number(query.offset) || 0;
    const limit = Number(query.limit) || 10;

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

    const filter = {
      OR: [
        { name: { contains: name, mode: 'insensitive' } },
        { description: { contains: description, mode: 'insensitive' } }
      ]
    };

    return await productRepository.findManyWithFilter({
      where: filter,
      orderBy,
      skip: offset,
      take: limit,
    });
  },


  async create(userId: number, body: any) {

    const { name, description, price, tags } = body;
    return productRepository.create({ userId, name, description, price, tags });
  },

  async update(userId: number, id: number, data: any) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('NOT_FOUND');
    if (product.userId !== userId) throw new Error('UNAUTHORIZED');
    return productRepository.update(id, data);
  },

  async remove(userId: number, id: number) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('NOT_FOUND');
    if (product.userId !== userId) throw new Error('UNAUTHORIZED');
    return productRepository.delete(id);
  },

  async like(userId: number, productId: number) {
    const product = await productRepository.findById(productId);
    if (!product) throw new Error('NOT_FOUND');

    const alreadyLike = await productRepository.findProductLike(userId, productId);
    if (alreadyLike) throw new Error('CONFLICT');

    return productRepository.createProductLike(userId, productId);
  },

  async cancelLike(userId: number, productId: number) {
    const product = await productRepository.findById(productId);
    if (!product) throw new Error('NOT_FOUND');

    const existLike = await productRepository.findProductLike(userId, productId);
    if (!existLike) throw new Error('NOT_LIKED');

    return productRepository.deleteProductLike(userId, productId);
  },

  async likesList(userId: number) {
    const likeProducts = await productRepository.findUserLikes(userId);
    const likeProductIds = likeProducts.map(lp => lp.productId);
    return productRepository.findProductsByIds(likeProductIds);
  },

  async isLiked(userId: number) {
    const productLikes = await productRepository.findUserLikes(userId);
    const likedProductIds = productLikes.map(pl => pl.productId);
    const allProducts = await productRepository.findAllProducts();
    return allProducts.map(product => ({
      ...product,
      isLiked: likedProductIds.includes(product.id),
    }));
  }
};
