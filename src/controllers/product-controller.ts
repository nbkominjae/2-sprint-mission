import { Request, Response } from 'express';
import { productService } from '../service/product-service';
import { assert } from 'superstruct';
import { productDto } from '../dtos/product-dto';
import { getListProductQuery } from '../types/query';
import { notificationService } from '../service/notification-service';


class ProductController {
  async getDetail(req: Request, res: Response) {
    try {
      const product = await productService.getDetail(Number(req.params.id));
  
      res.status(200).json(product);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const status = err.message === 'NOT_FOUND' ? 404 : 500;
        res.status(status).json({ message: err.message });
      }
    }
  }

  async getList(req: Request<{}, {}, {}, getListProductQuery>, res: Response) {
    try {
      const products = await productService.getList(req.query);
      
      res.json(products);
    } catch (err: unknown) {
      console.error('[ProductController.getList] Error:', err instanceof Error ? err.message : err);
      res.status(500).json({ message: '서버 에러' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      assert(req.body, productDto);
      const product = await productService.create(req.user.id, req.body);
      res.json(product);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'StructError') {
          res.status(400).json({ message: '유효성 검증 에러' });
        }
        res.status(500).json({ message: err.message });
      }
    }
  }

  async change(req: Request, res: Response) {
    try {
      const updated = await productService.update(req.user.id, Number(req.params.id), req.body);
      res.json(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const code = err.message === 'NOT_FOUND' ? 404 : err.message === 'UNAUTHORIZED' ? 401 : 500;
        res.status(code).json({ message: err.message });
      }
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const result = await productService.remove(req.user.id, Number(req.params.id));
      res.json(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const code = err.message === 'NOT_FOUND' ? 404 : err.message === 'UNAUTHORIZED' ? 401 : 500;
        res.status(code).json({ message: err.message });
      }
    }
  }

  async like(req: Request, res: Response) {
    try {
      const result = await productService.like(req.user.id, Number(req.params.productId));
      res.json(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const code = err.message === 'NOT_FOUND' ? 404 : err.message === 'CONFLICT' ? 409 : 500;
        res.status(code).json({ message: err.message });
      }
    }
  }

  async likeCancel(req: Request, res: Response) {
    try {
      const result = await productService.cancelLike(req.user.id, Number(req.params.productId));
      res.json(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const code = err.message === 'NOT_FOUND' || err.message === 'NOT_LIKED' ? 404 : 500;
        res.status(code).json({ message: err.message });
      }
    }
  }

  async likesList(req: Request, res: Response) {
    try {
      const products = await productService.likesList(req.user.id);
      res.json(products);
    } catch (err: unknown) {
      res.status(500).json({ message: '서버 에러' });
    }
  }

  async isLiked(req: Request, res: Response) {
    try {
      const products = await productService.isLiked(req.user.id);
      res.status(200).json(products);
    } catch (err: unknown) {
      res.status(500).json({ message: '서버 에러' });
    }
  }


  // 가격 변동 일어날 때 알림
  async isLikedPriceChange(req: Request, res: Response) {
    try {
      const user = req.user;
      const productId = Number(req.params.productId);

      // 좋아요한 상품 가져오기
      const likedProducts = await productService.isLiked(user.id);
      // 좋아요 여부 추출
      const myLikedProducts = likedProducts.filter((list) => list.isLiked);
      const targetProduct = myLikedProducts.find((p) => p.id === productId);
      if (!targetProduct) {
        res.status(400).json({ message: '좋아요한 상품이 없음' });
      }
      // 기존 가격
      const oldPrice = targetProduct?.price;
      // 가격 업데이트
      const updatedProduct = await productService.update(user.id, productId, req.body);
      // 가격 변동 확인
      if (updatedProduct.price !== oldPrice) {
        const message = `"${updatedProduct.name}" 가격이 ${oldPrice} → ${updatedProduct.price}원으로 변경되었습니다.`;
        await notificationService.sendNotification(user.id, "PRICE_CHANGE", message);

      }
      res.status(200).json({ updatedProduct });
    }
    catch (err: unknown) {
       console.error("sendNotification 에러:", err);
    }
  }
}

export default new ProductController();
