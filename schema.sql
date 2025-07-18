CREATE DATABASE pandamarket;

DROP TABLE IF EXISTS users;
CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	email VARCHAR(50) NOT NULL UNIQUE,
	nickname VARCHAR(12) NOT NULL UNIQUE,
	password VARCHAR(20) NOT NULL,
	CONSTRAINT email_rule CHECK (email LIKE ('%@%')),
	CONSTRAINT nickname_password_role CHECK (
		LENGTH(TRIM(nickname)) >= 2 AND LENGTH(TRIM(password)) >= 8)
);

DROP TABLE IF EXISTS products;
CREATE TABLE products(
	id SERIAL PRIMARY KEY,
	imageurl VARCHAR(50),
	name VARCHAR(10) NOT NULL,
	description VARCHAR(100) NOT NULL,
	price INT NOT NULL,
	tag VARCHAR(5) NOT NULL,
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT name_description_role CHECK (
		LENGTH(TRIM(name)) >= 2 AND LENGTH(TRIM(description)) >= 10)
);

DROP TABLE IF EXISTS products_likes;
CREATE TABLE products_likes (
	id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	product_id INT REFERENCES products(id) ON DELETE CASCADE,
	UNIQUE(user_id, product_id)
);

 
DROP TABLE IF EXISTS articles;
CREATE TABLE articles(
	id SERIAL PRIMARY KEY,
	title VARCHAR(20) NOT NULL,
	content VARCHAR(1000) NOT NULL,
	imageurl VARCHAR(50),
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT title_content_role CHECK (
		LENGTH(TRIM(title)) >= 2 AND LENGTH(TRIM(content)) >= 10
	)
);


DROP TABLE IF EXISTS comments;
CREATE TABLE comments(
	id SERIAL PRIMARY KEY,
	content VARCHAR(30) NOT NULL,
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	product_id INT REFERENCES products(id) ON DELETE CASCADE,
	article_id INT REFERENCES articles(id) ON DELETE CASCADE,
	CONSTRAINT one_target CHECK (
		(product_id IS NOT NULL AND article_id IS NULL) 
		OR
		(product_id IS NULL AND article_id IS NOT NULL)
	)
);
	