const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user", // user 為 collection 名稱
      required: [true, 'user Id 未瑱寫']
    },
    tags: [
      {
        type: String,
      }
    ],
    type: {
      type: String,
    },
    image: {
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: true
    },
    content: {
      type: String,
      required: [true, 'Content 未填寫'],
    },
    likes: [{ type: String }],

  },
  {
    id: false,
    versionKey: false,
    timestamps: true,
    collection: 'post',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })

// 虛擬 掛載 引用
postSchema.virtual('comments', {
  ref: 'comment',
  foreignField: 'post',
  localField: '_id',
})

const Post = mongoose.model('post', postSchema)

module.exports = Post