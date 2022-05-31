const bcrypt = require('bcryptjs')
const validator = require('validator')
const User = require('../models/user.modal.js')
const Post = require('../models/post.modal.js')
const appError = require('../service/appError')
const generateJWT = require('../service/generateJWT');



const user = {
  get: async (req, res) => {
    let users = await User.find()
    res.status(200).json({ users })
  },
  // 1.註冊會員
  sign_up: async (req, res, next) => {
    // 先進行各種可預期的自訂錯誤阻擋
    let { name, email, password, confirmPassword, sex, note } = req.body
    let isExisted = await User.findOne({ email: email })   // user重複

    if (!name || !email || !password || !confirmPassword) {
      return appError(400, '請留意必填欄位', next)
    }
    if (password !== confirmPassword) {
      return appError(400, '密碼確認不一致', next)
    }
    if (!validator.isEmail(email)) {
      return appError(400, '信箱格式錯誤', next)
    }
    if (!validator.isLength(password, { min: 6 })) {
      return appError(400, '密碼至少6個字元', next)
    }
    if (isExisted !== null) {
      return appError(400, 'Email已被註冊', next)
    }

    // bcrypt加密
    password = await bcrypt.hash(password, 12)
    const newUser = await User.create({ email, password, name, sex, note })
    generateJWT(newUser, res) // res
  },
  // 2.登入會員
  sign_in: async (req, res, next) => {
    // 先進行各種可預期的自訂錯誤阻擋
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!email || !password) {
      return appError(400, '請留意必填欄位', next)
    }
    if (user == null) {
      return appError(400, '查無此人，此Email尚未註冊', next)
    }
    const auth = await bcrypt.compare(password, user.password) // 傳入的 與 user的
    if (!auth) {
      return appError(400, '密碼錯誤', next)
    }
    generateJWT(user, res) // res
  },
  // 3.重設密碼
  updatePassword: async (req, res, next) => {
    let { newPassword, newPasswordConfirm } = req.body
    if (!newPassword || !newPasswordConfirm) {
      return appError(400, '請留意必填欄位', next)
    }
    if (newPassword !== newPasswordConfirm) {
      return appError(400, '新密碼確認不一致', next)
    }
    // 新密碼加密
    newPassword = await bcrypt.hash(newPassword, 12);
    // req.user 來自中介 isAuth 給的
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword
    });
    generateJWT(user, res)
  },
  // 4.取得個人資料
  profile: async (req, res, next) => {
    // 已在 middleware isAuth 取得 user (req.user)
    res.status(200).json({
      status: 'success',
      user: req.user
    });
  },
  // 5.更新個人資料
  updateProfile: async (req, res, next) => {
    const id = req.user.id
    const data = req.body
    if (!data.name) {
      return appError(400, '姓名不得留空', next)
    }
    if (!data.sex || (data.sex !== 'Male' && data.sex !== 'Female')) {
      return appError(400, '性別輸入錯誤且不得留空', next)
    }
    const user = await User.findByIdAndUpdate(id, data, { new: true })
    // new:true 返回更新後的資料
    if (user !== null) {
      res.status(200).json({ user })
    } else {
      appError(400, 'User不存在', next)
    }

  },

  // 1.追蹤朋友
  follow: async (req, res, next) => {
    //  req.user.id 主動追蹤的人
    //  req.params.id  被追蹤的人
    let user = await User.findById(req.params.id)

    if (!user) {
      return appError(400, 'User不存在', next)
    }
    if (req.user.id === req.params.id) {
      return appError(400, '無法追蹤自己', next)
    }
    // 主動追蹤的人 following list 加入(如果不存在) 一個 user (被追蹤的人)
    await User.updateOne(
      { _id: req.user.id, 'following.user': { $ne: req.params.id } },
      { $addToSet: { following: { user: req.params.id } } })

    // 被追蹤的人 followers list 加入(如果不存在) 一個 user (追蹤我的人)
    await User.updateOne(
      { _id: req.params.id, 'followers.user': { $ne: req.user.id } },
      { $addToSet: { followers: { user: req.user.id } } })

    res.status(200).json({ status: 'success', message: '您已成功追蹤' })
  },
  // 2.取消追蹤朋友
  unfollow: async (req, res, next) => {
    let user = await User.findById(req.params.id)

    if (req.params.id === req.user.id) {
      return appError(401, '無法取消追蹤自己', next);
    }

    if (!user) {
      return appError(400, 'User不存在', next)
    }

    await User.updateOne({ _id: req.user.id },
      { $pull: { following: { user: req.params.id } } })

    await User.updateOne({ _id: req.params.id },
      { $pull: { followers: { user: req.user.id } } })

    res.status(200).json({ status: 'success', message: '您已取消追蹤此用戶' })
  },
  // 3.取得個人按讚列表
  getLikeList: async (req, res, next) => {
    const id = req.user.id
    const posts = await Post.find({ "likes": id }).populate({
      path: "user",
      select: "name _id"
    }).populate({
      path: 'comments',
      select: 'comment user'
    });;
    res.status(200).json({
      status: 'success',
      posts: posts
    });
  },
  // 4.取得個人追蹤名單
  following: async (req, res, next) => {
    res.status(200).json({
      status: 'success',
      following: req.user.following
    });
  },
}

module.exports = user