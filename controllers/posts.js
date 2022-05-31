const appError = require('../service/appError')
const handleSuccess = require('../service/handleSuccess')

const Post = require('../models/post.modal.js')
const User = require('../models/user.modal.js')
const Comment = require('../models/comment.modal.js')

const posts = {
  // 1.取得所有貼文列表
  getAllPosts: async (req, res) => {
    const timeSort = req.query.timeSort == 'asc' ? 1 : -1
    const keyword = req.query.q !== undefined ? { "content": new RegExp(req.query.q) } : {};
    // asc 遞增(由小到大，由舊到新) createdAt ; 
    // desc 遞減(由大到小、由新到舊) "-createdAt"
    let posts = await Post.find(keyword).populate({
      path: 'user',
      select: 'name photo'
    }).populate({
      path: 'comments',
      select: 'comment user'
    }).sort({ 'createdAt': timeSort })
    handleSuccess(res, { posts })
  },
  // 2.建立貼文
  createPost: async (req, res, next) => {
    const data = req.body
    if (!data.content) {
      return appError(400, '請留意必填欄位。', next)
    }
    // 自定義可預期 => appError -> app.use(err,...)
    // 捕捉未定義 => handleErrorAsync -> app.use(err,...)
    const newPost = await Post.create(
      {
        user: req.user.id,
        content: data.content,
        type: data.type,
        tags: data.tags,
        image: data.image
      }
    )
    handleSuccess(res, { newPost })
  },
  // 3.貼文按讚
  likes: async (req, res) => {
    const id = req.params.id
    const userId = req.user.id

    await Post.findByIdAndUpdate(id, { $addToSet: { "likes": userId } })
    handleSuccess(res, { message: '按讚成功!' })

  },
  // 4.貼文收回讚
  unlike: async (req, res) => {
    const id = req.params.id
    const userId = req.user.id

    await Post.findByIdAndUpdate(id, { $pull: { "likes": userId } })
    handleSuccess(res, { message: '已收回讚!' })

  },
  // 5.留言
  comment: async (req, res, next) => {
    const user = req.user // from isAuth.js
    const post = req.params.id
    const { comment } = req.body
    const targetPost = await Post.findById(post)

    if (!targetPost) {
      return appError(400, '文章不存在', next)
    }
    if (!comment) {
      return appError(400, '留言不得留空', next)
    }
    const newComment = await Comment.create({ post, user, comment })

    handleSuccess(res, { newComment })
  },
  // 6.取得貼文 by id
  getPostById: async (req, res, next) => {
    const id = req.params.id

    const post = await Post.findById(id).populate({
      path: 'comments',
      select: 'comment user'
    });

    if (post !== null) {
      res.status(200).json({ post })
    } else {
      appError(400, '文章不存在', next)
    }

  },
  // 7.取得指定User的貼文列表
  getPostsByUserId: async (req, res, next) => {
    const userId = req.params.id
    const posts = await Post.find({ "user": userId }).populate({
      path: 'comments',
      select: 'comment user'
    });
    res.status(200).json({ posts })
  },


  // other
  search: async (req, res) => {
    const keyword = req.query.q !== undefined ? { "content": new RegExp(req.query.q) } : {};
    const posts = await Post.find(keyword)
    handleSuccess(res, { keyword: req.query.q, posts })

  },
  updatePost: async (req, res, next) => {
    const id = req.params.id
    const data = req.body

    if (!data.content) {
      return appError(400, '請確認必填欄位', next)
    }
    const post = await Post.findByIdAndUpdate(id, data, { new: true })
    // new:true 返回更新後的資料
    if (post !== null) {
      res.status(200).json({ post })
    } else {
      appError(400, '文章不存在', next)
    }

  },
  deletePost: async (req, res) => {
    const id = req.params.id
    const post = await Post.findByIdAndDelete(id)
    if (post !== null) {
      handleSuccess(res, { message: '刪除成功!' })
    } else {
      appError(400, '找不到文章', next)
    }
  },

}

module.exports = posts