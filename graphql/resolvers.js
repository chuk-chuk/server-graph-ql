const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Post = require('../models/post')

module.exports = {
  createUser: async ({ userInput }, req) =>  {
    // const email = args.userInput.email
    const errors = []
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "email is invalid" })
    }
    
    if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
      errors.push({ message: "password is too short" })
    }

    if(errors.length > 0) {
      const error = new Error('Invalid input')
      error.data = errors
      throw error
    }

    const existingUser = await User.findOne({ email: userInput.email})
    
    if (existingUser) {
      const error = new Error('User exists already!')
      throw error
    }

    const hashedPassword = await bcrypt.hashSync(userInput.password, 12)

    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword
    })
    
    const createdUser = await user.save()

    return {...createdUser._doc, _id: createdUser._id.toString()}
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email })

    if (!user) {
      const error = new Error('User not found')
      error.code = 401
      throw error
    }

    const isEqual = await bcrypt.compare(password, user.password)
    
    if (!isEqual) {
      const error = new Error('User login error')
      error.code = 401
      throw error
    }

    const token = jwt.sign({
      email: user.email, 
      userId: user._id.toString()
    }, "somesupersecret", { expiresIn: "1h"})

    return { token: token, userId: user._id.toString() }
  },

  createPost: async ({ postInput }, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!')
      error.code = 401
      throw error
    }
    const errors = []
    
    if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
      errors.push({ message: "title is invalid" })
    }
    
    if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
      errors.push({ message: "content is invalid" })
    }
    
    if (errors.length > 0) {
      const error = new Error('Invalid input')
      error.data = errors
      error.code = 422
      throw error
    }
    
    const user = await User.findById(req.userId)

     if (!user) {
      const error = new Error('Invalid user')
      error.data = errors
      error.code = 401
      throw error
     }

     const post = new Post({
       title: postInput.title,
       content: postInput.content,
       imageUrl: postInput.imageUrl,
       creator: user
     })
     const createdPost = await post.save()
     user.posts.push(createdPost)   // add post to users' posts
     await user.save()
     return { ...createdPost._doc, 
      _id: createdPost._id.toString(), 
      createdAt: createPost.createdAt.toISOString(), 
      updatedAt: createdPost.updatedAt.toISOString()
    }
  },

  posts: async ({ page }, req) => {
    if (!req.isAuth) {
      const error = new Error('Not authenticated!')
      error.code = 401
      throw error
    }
    if (!page) {
      page = 1
    }

    const perPage = 2
    const totalPosts = await Post.find().countDocuments()
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('creator')

    return { posts: posts.map(post => {
      return {
        ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
      }
    }), totalPosts: totalPosts }
  }
}

