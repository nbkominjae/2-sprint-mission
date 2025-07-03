// controllers/article-controller.ts
import { Request, Response } from 'express';
import { articleService } from '../service/article-service';

class ArticleController {
  async getDetail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const article = await articleService.getDetail(id);
      res.json(article);
    } catch (err: unknown) {
      res.status(err.message === 'NOT_FOUND' ? 404 : 500).json({ message: err.message });
    }
  }

  async getArticleList(req: Request, res: Response) {
    try {
      const articles = await articleService.getList(req.query);
      res.json(articles);
    } catch (err) {
      res.status(500).json({ message: '서버 에러' });
    }
  }

  async createArticle(req: Request, res: Response) {
    try {
      const article = await articleService.create(req.user.id, req.body);
      res.json(article);
    } catch (err) {
      if (err.name === 'StructError') {
         res.status(400).json({ message: '유효성 검증 에러' });
      }
      res.status(500).json({ message: err.message });
    }
  }

  async changeArticle(req: Request, res: Response) {
    try {
      const updated = await articleService.update(req.user.id, Number(req.params.id), req.body);
      res.json(updated);
    } catch (err) {
      const code = err.message === 'NOT_FOUND' ? 404 : err.message === 'UNAUTHORIZED' ? 401 : 500;
      res.status(code).json({ message: err.message });
    }
  }

  async deleteArticle(req: Request, res: Response) {
    try {
      const result = await articleService.remove(req.user.id, Number(req.params.id));
      res.json(result);
    } catch (err) {
      const code = err.message === 'NOT_FOUND' ? 404 : err.message === 'UNAUTHORIZED' ? 401 : 500;
      res.status(code).json({ message: err.message });
    }
  }

  async articleLike(req: Request, res: Response) {
    try {
      const result = await articleService.like(req.user.id, Number(req.params.articleId));
      res.json(result);
    } catch (err) {
      const code = err.message === 'NOT_FOUND' ? 404 : err.message === 'CONFLICT' ? 409 : 500;
      res.status(code).json({ message: err.message });
    }
  }

  async articleLikeCancel(req: Request, res: Response) {
    try {
      const result = await articleService.cancelLike(req.user.id, Number(req.params.articleId));
      res.json(result);
    } catch (err) {
      const code = err.message === 'NOT_FOUND' || err.message === 'NOT_LIKED' ? 404 : 500;
      res.status(code).json({ message: err.message });
    }
  }

  async isLikedArticleList(req: Request, res: Response) {
    try {
      const result = await articleService.likedArticleList(req.user.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default new ArticleController();
