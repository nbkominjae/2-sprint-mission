import bcrypt from 'bcrypt';
import { userRepository } from '../repository/user-repository';
import { createToken, verifyRefreshToken } from '../lib/token';
import { REFRESH_TOKEN_COOKIE_NAME } from '../lib/constants';
import type { Response } from 'express';
import { number } from 'superstruct';

export const userService = {
  async createUser(email: string, nickname: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userRepository.createUser({ email, nickname, password: hashedPassword });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async login(nickname: string, password: string) {
    const user = await userRepository.findByNickname(nickname);
    if (!user) throw new Error('USER_NOT_FOUND');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('INVALID_PASSWORD');

    const tokens = createToken(user.id);
    return { user, tokens };
  },

  async refreshTokens(refreshToken: string, res: Response) {
    if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

    const { userId } = verifyRefreshToken(refreshToken);

    const user = await userRepository.findById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const tokens = createToken(user.id);
    this.setTokenCookies(res, tokens.refreshToken);

    return tokens.accessToken;
  },

  setTokenCookies(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/users',
    });
  },

  async getUserInfo(userId: number) {
    const userInform = await userRepository.findById(userId);
    if (!userInform) throw new Error('USER_NOT_FOUND');
    return userInform;
  },

  async updateUser(
    userId: number, 
    email: string,
    nickname: string,
    image: string,
    password: string
  ) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userRepository.updateUser(userId, {
      email,
      nickname,
      image,
      password: hashedPassword,
    });
    return updatedUser;
  },

  async getUserProductList(userId: number) {
    return userRepository.findProductsByUserId(userId);
  },
};
