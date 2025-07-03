import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import UserController from '../controllers/UserController.js';

const router = express.Router();

router.post('/create', (req, res) => UserController.createUser(req, res));
router.post('/login', (req, res) => UserController.login(req, res));
router.post('/refresh', (req, res) => UserController.refreshTokens(req, res));
router.get('/info', authenticate, (req, res) => UserController.inform(req, res));
router.patch('/change', authenticate, (req, res) => UserController.change(req, res));
router.get('/productList', authenticate, (req, res) => UserController.productList(req, res));

export default router;


