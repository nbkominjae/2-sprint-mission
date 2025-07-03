import express from 'express';
import authenticate from '../middlewares/authenticate';
import ProductController from '../controllers/product-controller';

const router = express.Router();

// 상품 상세조회 - 상품 ID를 받아 해당 상품 정보 반환
router.get('/detail/:id', (req, res) => ProductController.getDetail(req, res));

// 상품 목록조회 - 검색어, 페이징, 정렬 옵션에 따른 상품 리스트 반환
router.get('/list', (req, res) => ProductController.getList(req, res));

// 상품 등록 - 로그인한 유저만 상품 등록 가능 (유효성 검사 포함)
router.post('/create', authenticate, (req, res) => ProductController.create(req, res));

// 상품 수정 - 로그인한 유저, 본인 상품만 수정 가능
router.patch('/change/:id', authenticate, (req, res) => ProductController.change(req, res));

// 상품 삭제 - 로그인한 유저, 본인 상품만 삭제 가능
router.delete('/remove/:id', authenticate, (req, res) => ProductController.remove(req, res));

// 상품 좋아요 추가 - 로그인한 유저가 특정 상품에 좋아요 누르기
router.post('/likes/:productId', authenticate, (req, res) => ProductController.like(req, res));

// 상품 좋아요 취소 - 로그인한 유저가 특정 상품 좋아요 취소
router.delete('/likesCancel/:productId', authenticate, (req, res) => ProductController.likeCancel(req, res));

// 로그인한 유저가 좋아요한 상품 목록 조회
router.get('/likesList', authenticate, (req, res) => ProductController.likesList(req, res));

// 상품 목록 조회 시, 로그인 유저가 좋아요 눌렀는지 여부(isLiked 필드 포함)
router.get('/isLiked', authenticate, (req, res) => ProductController.isLiked(req, res));

export default router;
