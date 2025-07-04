import { Request, Response } from 'express';
import { userService } from '../service/user-service';
import { REFRESH_TOKEN_COOKIE_NAME } from '../lib/constants';

class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const { email, nickname, password } = req.body;
      const user = await userService.createUser(email, nickname, password);
      res.status(201).json(user);
    } catch (err: unknown) {
      console.error(err);
      res.status(500).json({ message: '서버 에러' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { nickname, password } = req.body;
      const { user, tokens } = await userService.login(nickname, password);

      userService.setTokenCookies(res, tokens.refreshToken);
      res.status(200).json({ accessToken: tokens.accessToken });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'USER_NOT_FOUND') {
          res.status(401).json({ message: '아이디가 존재하지 않습니다.' });
        }
        if (err.message === 'INVALID_PASSWORD') {
          res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
        }
      }
      res.status(500).json({ message: '서버 에러' });
    }
  }

  async refreshTokens(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
      const accessToken = await userService.refreshTokens(refreshToken, res);
      res.status(200).json({ accessToken });
    } catch (err: unknown) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }

  async inform(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) res.status(401).json({ message: '권한이 없습니다.' });

      const userInfo = await userService.getUserInfo(user.id);
      res.json(userInfo);
    } catch (err) {
      res.status(500).json({ message: '서버 에러' });
    }
  }

  async change(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) res.status(401).json({ message: '권한이 없습니다.' });

      const { email, nickname, image, password } = req.body;
      const updatedUser = await userService.updateUser(user.id, email, nickname, image, password);
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: '서버 에러' });
    }
  }

  async productList(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) res.status(401).json({ message: '권한이 없습니다.' });

      const products = await userService.getUserProductList(user.id);
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: '서버 에러' });
    }
  }
}

export default new UserController();
