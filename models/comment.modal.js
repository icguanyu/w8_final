const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, '留言內容未填寫'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      require: [true, '留言內容必須屬於某位使用者(user)']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'post',
      require: [true, '留言內容必須屬於某篇文章(post)'],
    }
  },
  {
    versionKey: false,
    collection: 'comment'
  }
)

schema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name id'
  })
})


const Comment = mongoose.model('comment', schema)

module.exports = Comment