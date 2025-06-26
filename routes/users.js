import express from 'express';
import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import { createToken } from '../lib/token.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/create', createUser);
router.post('/login', login);
router.get('/info', authenticate, inform);
router.patch('/change', authenticate, change);
router.get('/productList', authenticate, productList);

// 회원가입 API

async function createUser(req, res) {
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

async function login(req, res) {
  const { nickname, password } = req.body;
  const user = await db.user.findUnique({
    where: { nickname },
  });
  if (!user) {
    return res.status(401).json({ message: " 없는 유저임 " })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "유효하지 않은 비밀번호" })
  }
  const { accessToken, refreshToken } = createToken(user.id);
  return res.status(200).json({ accessToken, refreshToken });

};


// 유저 정보 조회 

async function inform(req, res) {
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

async function change(req, res) {
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

async function productList(req, res) {
  const user = req.user;
  const userProduct = await db.product.findMany({
    where: { userId: user.id }
  });
  res.json(userProduct)
}

export default router;
