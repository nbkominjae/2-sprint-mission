import { db } from "../utils/db.js";
import { verifyAccessToken } from "../../lib/token.js";

async function authenticate(req, res, next) {
  const reqHeaders = req.headers.authorization;
  const accessToken = reqHeaders && reqHeaders.startsWith('Bearer ')
    ? reqHeaders.slice(7)  // "Bearer " 길이만큼 잘라냄
    : null;
  if (!accessToken) {
    return res.status(401).json({ message: '만료된 사용자' });
  }
  try {
    const { userId } = verifyAccessToken(accessToken);

    // 실제 있는 유저인지 확인 

    const user = await db.user.findUnique({
      where: { id: userId }
    });
    req.user = user;

  } catch (error) {
    return res.status(401).json({ message: '권한없음' })
  }
  next();

}

export default authenticate;