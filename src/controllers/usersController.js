import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import { createToken, verifyRefreshToken } from '../lib/token.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '../lib/constants.js';

class UserController {

  // 회원가입 API

  async createUser(req, res) {
    const { email, nickname, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await db.user.create({
      data: { email, nickname, password: hashedPassword },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).send(userWithoutPassword)
  };


  // 회원가입 API

  async createUser(req, res) {
    const { email, nickname, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await db.user.create({
      data: { email, nickname, password: hashedPassword },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).send(userWithoutPassword)
  };

  // 로그인 

  async login(req, res) {
    const { nickname, password } = req.body;
    const user = await db.user.findUnique({
      where: { nickname },
    });
    if (!user) {
      return res.status(401).json({ message: " 아이디가 존재하지 않습니다. " })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." })
    }
    const { accessToken, refreshToken } = createToken(user.id);
    setTokenCookies(res, refreshToken);
    return res.status(200).json({ accessToken });


  };

  async refreshTokens(req, res) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { userId } = verifyRefreshToken(refreshToken);

    const user = await db.user.findUnique({
      where: { id: userId }
    })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { accessToken, refreshToken: newRefreshToken } = createToken(user.id);
    setTokenCookies(res, newRefreshToken);
    res.status(200).json({ accessToken });
  }

  // refresh 토큰 저장 방식

  setTokenCookies(res, refreshToken) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/users',
    });
    console.log(REFRESH_TOKEN_COOKIE_NAME);

  };


  // 유저 정보 조회 

  async inform(req, res) {
    const user = req.user;
    const userInform = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        nickname: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    res.json(userInform);
  };

  // 유저 정보 수정 

  async change(req, res) {
    const user = req.user;
    const { email, nickname, image, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)
    const changeInform = await db.user.update({
      where: { id: user.id },
      data: { email, nickname, image, password: hashedPassword },
      select: {
        id: true,
        nickname: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    res.json(changeInform);
  };

  // 유저의 상품 목록 조회 

  async productList(req, res) {
    const user = req.user;
    const userProduct = await db.product.findMany({
      where: { userId: user.id }
    });
    res.json(userProduct)
  }
};

export default new UserController();




