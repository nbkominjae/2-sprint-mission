// repositories/article-repository.ts
import { db } from '../utils/db';
import { createArticle } from '../types/article';
import { getListArticleQuery } from '../types/query';

export const articleRepository = {
  findById: (id: number) => db.article.findUnique({ where: { id } }),
  findManyWithFilter: (query: any) => db.article.findMany(query),
  create: (data: createArticle) => db.article.create({ data }),
  update: (id: number, data: any) => db.article.update({ where: { id }, data }),
  delete: (id: number) => db.article.delete({ where: { id } }),

  findLike: (userId: number, articleId: number) =>
    db.articleLike.findUnique({ where: { userId_articleId: { userId, articleId } } }),
  createLike: (userId: number, articleId: number) =>
    db.articleLike.create({ data: { userId, articleId } }),
  deleteLike: (userId: number, articleId: number) =>
    db.articleLike.delete({ where: { userId_articleId: { userId, articleId } } }),

  findLikedArticlesByUser: (userId: number) =>
    db.articleLike.findMany({ where: { userId }, select: { articleId: true } }),
  findAllArticles: () =>
    db.article.findMany({
      select: { id: true, title: true, content: true, createdAt: true, updatedAt: true, userId: true },
      orderBy: { createdAt: 'desc' }
    })
};
