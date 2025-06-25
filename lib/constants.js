import dotenv from 'dotenv';

dotenv.config();

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

export { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET };