const express = require('express');
const router = express.Router();
const posts = require('../controllers/posts')
const handleErrorAsync = require('../service/handleErrorAsync')
const isAuth = require('../middleware/isAuth')
// middleware
const checkKeyword = require('../middleware/post/checkKeyword')


// 1.取得所有貼文列表
router.get('/', handleErrorAsync((req, res, next) => posts.getAllPosts(req, res, next)));
// 2.建立貼文
router.post('/', isAuth, handleErrorAsync((req, res, next) => posts.createPost(req, res, next)))
// 3.貼文按讚
router.post('/:id/likes', isAuth, handleErrorAsync((req, res, next) => posts.likes(req, res, next)))
// 4.貼文收回讚
router.delete('/:id/unlike', isAuth, handleErrorAsync((req, res, next) => posts.unlike(req, res, next)))
// 5.留言
router.post('/:id/comment', isAuth, handleErrorAsync((req, res, next) => posts.comment(req, res, next)))
// 6.取得貼文 by id
router.get('/:id', handleErrorAsync((req, res, next) => posts.getPostById(req, res, next)))
// 7.取得個人貼文列表
router.get('/user/:id', isAuth, handleErrorAsync((req, res, next) => posts.getPostsByUserId(req, res, next)))


// other
// 關鍵字搜尋貼文
router.get('/search', checkKeyword, handleErrorAsync((req, res, next) => posts.search(req, res, next)));
// 更新貼文
router.patch('/:id', handleErrorAsync((req, res, next) => posts.updatePost(req, res, next)))
// 刪除貼文
router.delete('/:id', handleErrorAsync((req, res, next) => posts.deletePost(req, res, next)))


module.exports = router;
