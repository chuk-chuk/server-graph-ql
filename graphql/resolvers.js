
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

module.exports = {
  // hello: () => {
  //   return {
  //     text: 'Hello World!',
  //     views: 1234
  //   }
  // },

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
  }
}

