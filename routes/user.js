const express = require('express');
const handleErrorAsync = require('../service/handleErrorAsync')
const isAuth = require('../middleware/isAuth')

const router = express.Router();
const user = require('../controllers/user')

// 會員功能
// 1.註冊會員
router.post('/sign_up', handleErrorAsync((req, res, next) => user.sign_up(req, res, next)))
// 2.登入會員
router.post('/sign_in', handleErrorAsync((req, res, next) => user.sign_in(req, res, next)))
// 3.重設密碼
router.post('/updatePassword', isAuth, handleErrorAsync((req, res, next) => user.updatePassword(req, res, next)))
// 4.取得個人資料
router.get('/profile', isAuth, handleErrorAsync((req, res, next) => user.profile(req, res, next)));
// 5.更新個人資料
router.patch('/profile', isAuth, handleErrorAsync((req, res, next) => user.updateProfile(req, res, next)));

// 會員按讚追蹤動態
// 1.追蹤朋友
router.post('/:id/follow', isAuth, handleErrorAsync((req, res, next) => user.follow(req, res, next)));
// 2.取消追蹤朋友
router.delete('/:id/unfollow', isAuth, handleErrorAsync((req, res, next) => user.unfollow(req, res, next)));
// 3.取得個人按讚列表
router.get('/getLikeList', isAuth, handleErrorAsync((req, res, next) => user.getLikeList(req, res, next)));
// 4.取得個人追蹤名單
router.get('/following', isAuth, handleErrorAsync((req, res, next) => user.following(req, res, next)));

module.exports = router;
