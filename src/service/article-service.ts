// service/article-service.ts

import { articleRepository } from '../repository/article-repository';
import { getListArticleQuery } from '../types/query';


export const articleService = {
  getDetail: async (id: number) => {
    const article = await articleRepository.findById(id);
    if (!article) throw new Error('NOT_FOUND');
    return article;
  },

  getList: async (query: getListArticleQuery) => {
    const { title = '', content = '', offset = 0, limit = 10, order = 'newest' } = query;
    const orderBy =
      order === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    return articleRepository.findManyWithFilter({
      where: {
        OR: [
          { title: { contains: title, mode: 'insensitive' } },
          { content: { contains: content, mode: 'insensitive' } },
        ]
      },
      select: { id: true, title: true, content: true, createdAt: true },
      orderBy,
      skip: Number(offset),
      take: Number(limit)
    });
  },

  create: async (userId: number, body: any) => {
    
    const { title, content } = body;
    return articleRepository.create({ title, content, userId });
  },

  update: async (userId: number, id: number, data: any) => {
    const article = await articleRepository.findById(id);
    if (!article) throw new Error('NOT_FOUND');
    if (article.userId !== userId) throw new Error('UNAUTHORIZED');
    return articleRepository.update(id, data);
  },

  remove: async (userId: number, id: number) => {
    const article = await articleRepository.findById(id);
    if (!article) throw new Error('NOT_FOUND');
    if (article.userId !== userId) throw new Error('UNAUTHORIZED');
    return articleRepository.delete(id);
  },

  like: async (userId: number, articleId: number) => {
    const article = await articleRepository.findById(articleId);
    if (!article) throw new Error('NOT_FOUND');
    const exist = await articleRepository.findLike(userId, articleId);
    if (exist) throw new Error('CONFLICT');
    return articleRepository.createLike(userId, articleId);
  },

  cancelLike: async (userId: number, articleId: number) => {
    const article = await articleRepository.findById(articleId);
    if (!article) throw new Error('NOT_FOUND');
    const exist = await articleRepository.findLike(userId, articleId);
    if (!exist) throw new Error('NOT_LIKED');
    return articleRepository.deleteLike(userId, articleId);
  },

  likedArticleList: async (userId: number) => {
    const liked = await articleRepository.findLikedArticlesByUser(userId);
    const ids = liked.map(l => l.articleId);
    const all = await articleRepository.findAllArticles();
    return all.map(a => ({ ...a, isLiked: ids.includes(a.id) }));
  }
};
