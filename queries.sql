/*
  다음 경우들에 대해 총 14개의 SQL 쿼리를 작성해 주세요.
  예시로 값이 필요한 경우 적당한 값으로 채워넣어서 작성하면 됩니다. 
*/

/*
  1. 내 정보 업데이트 하기
  - 닉네임을 "test"로 업데이트
  - 현재 로그인한 유저 id가 1이라고 가정
*/

--id를 SERIAL로 해서 생성실패한 데이터 때문에 id 2로 시작
--users 데이터 생성

INSERT INTO users (email, nickname, password) VALUES
	('test1@naver.com', 'test2', '12345678')
;
INSERT INTO users (email, nickname, password) VALUES
	('test4@naver.com', 'test42', '123452678')
;
INSERT INTO users (email, nickname, password) VALUES
	('test5@naver.com', 'test422', '123452678')
;

--유저 조회

SELECT * FROM users;

--유저 닉네임 업데이트

UPDATE users SET nickname = 'test1' WHERE id = 2;
UPDATE users SET nickname = 'test' WHERE id = 2;

/*
  2. 내가 생성한 상품 조회
  - 현재 로그인한 유저 id가 1이라고 가정
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 3번째 페이지
*/

--user_id로 상품 생성

INSERT INTO products (name, description, price, tag, user_id) VALUES
	('testproduct1', '별로안좋아요dydydyddtddttd', 599999, '전자제품',2)
INSERT INTO products (name, description, price, tag, user_id) VALUES
	('testproduct2', '별로안좋아요dydsds', 59923999, '전자제품',2)
INSERT INTO products (name, description, price, tag, user_id) VALUES
	('testproduct3', '별로안좋아요dydsd33s', 59923999, '전자제품',4)

--2.페이지네이션 

SELECT *
FROM products
WHERE user_id = 2
ORDER BY created_at DESC
LIMIT 10
OFFSET 20
;

SELECT * FROM products;

/*
  3. 내가 생성한 상품의 총 개수
*/

--2번 유저의 상품

SELECT COUNT(*) AS total_products_count
FROM products
WHERE user_id = 2
;

/*
  4. 내가 좋아요 누른 상품 조회
  - 현재 로그인한 유저 id가 1이라고 가정
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 3번째 페이지
*/

SELECT * FROM products_likes;

--좋아요 생성 (어떤 유저가 어떤 상품에)

INSERT INTO products_likes (user_id, product_id) VALUES
	(2, 2)
INSERT INTO products_likes (user_id, product_id) VALUES
	(2, 3)
INSERT INTO products_likes (user_id, product_id) VALUES
	(2, 4)
INSERT INTO products_likes (user_id, product_id) VALUES
	(4, 4)
INSERT INTO products_likes (user_id, product_id) VALUES
	(6, 4)

-- 4

SELECT *
FROM products
 INNER JOIN products_likes ON products.id = products_likes.product_id
WHERE products_likes.user_id = 2
ORDER BY products.created_at DESC
LIMIT 10
OFFSET 20
;

/*
  5. 내가 좋아요 누른 상품의 총 개수
*/

SELECT COUNT(*) AS Liked_by_me
FROM products_likes
WHERE user_id = 2 
;

/*
  6. 상품 생성
  - 현재 로그인한 유저 id가 1이라고 가정
*/

-- 2번 유저의 상품 생성

INSERT INTO products (name, description, price, tag, user_id) VALUES
	('test33', '상품생성테스트입니다', 5000000, '가전제품', 2)
INSERT INTO products (name, description, price, tag, user_id) VALUES
	('test34', '상품생성테스트입니다2', 50000020, '가전제품', 2)

/*
  7. 상품 목록 조회
  - "test" 로 검색
  - 최신 순으로 정렬
  - 10개씩 페이지네이션, 1번째 페이지
  - 각 상품의 좋아요 개수를 포함해서 조회하기
*/

SELECT
  products.*,
  COUNT(products_likes.id) AS like_count
FROM products
LEFT JOIN products_likes ON products.id = products_likes.product_id
WHERE products.name ILIKE '%test%'
GROUP BY products.id
ORDER BY products.created_at DESC
LIMIT 10 
OFFSET 0
;

/*
  8. 상품 상세 조회
  - 1번 상품 조회
*/
--2번 상품 조회

SELECT *
FROM products
WHERE id = 2
;

/*
  9. 상품 수정
  - 1번 상품 수정
*/
--2번 상품 수정
 
UPDATE products SET imageurl = 'example111' WHERE id = 2;
UPDATE products SET name = 'example111' WHERE id = 2;
UPDATE products SET description = 'example111' WHERE id = 2;


UPDATE products 
SET	
	price = 50000,
	tag = '그냥제품'
WHERE id = 2;

/*
  10. 상품 삭제
  - 1번 상품 삭제
*/

DELETE FROM products WHERE id = 2;

/*
  11. 상품 좋아요
  - 1번 유저가 2번 상품 좋아요
*/

-- 2번  유저가 2번 상품 좋아요

INSERT INTO products_likes (user_id, product_id) VALUES
	(2, 2)

/*
  12. 상품 좋아요 취소
  - 1번 유저가 2번 상품 좋아요 취소
*/

DELETE FROM products_likes WHERE user_id = 2 AND product_id = 2;

/*
  13. 상품 댓글 작성
  - 1번 유저가 2번 상품에 댓글 작성
*/

-- 상품 댓글은 article_id가 NULL  

INSERT INTO comments (content, user_id , product_id, article_id) VALUES
	('2번 상품 안좋아요', 2, 2, NULL)

SELECT * FROM comments;

/*
  14. 상품 댓글 조회
  - 1번 상품에 달린 댓글 목록 조회
  - 최신 순으로 정렬
  - 댓글 날짜 2025-03-25 기준으로 커서 페이지네이션
  - 10개씩 페이지네이션
*/

SELECT * 
FROM comments
WHERE product_id = 2 AND created_at < '2025-03-25'
ORDER BY created_at DESC
LIMIT 10 
;
