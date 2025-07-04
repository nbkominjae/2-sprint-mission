import dotenv from 'dotenv';

dotenv.config();

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || 'access-token';
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh-token';
const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refresh-token';

export { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET , REFRESH_TOKEN_COOKIE_NAME };