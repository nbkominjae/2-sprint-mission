import express from 'express';
import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import { createToken } from '../lib/token.js';

const router = express.Router();
router.post('/create', createUser);
router.post('/login', login);

// 회원가입 API

async function createUser(req, res) {
  const { email, nickname, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt)
  const user = await db.user.create({
    data: { email, nickname, password: hashedPassword },
  });

  const { password : _,  ...userWithoutPassword} = user;
  res.status(201).send(userWithoutPassword)
};

// 로그인 

async function login(req,res){
  const {nickname, password} = req.body;
  const user = await db.user.findUnique({
    where :{ nickname }, 
  });
  if(!user) {
    return res.status(401).json({message : " 없는 유저임 "})
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if(!isPasswordValid) {
    return res.status(401).json({message : "유효하지 않은 비밀번호"})
  }
  const { accessToken , refreshToken } = createToken(user.id);
  return res.status(200).json( {accessToken , refreshToken});
  
};



export default router;
