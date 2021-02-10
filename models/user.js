const mongoose = require('mongoose')
const { Schema } = mongoose

 const  userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: 'Please enter your email',
    trim: true,

  },
  name: {
    type: String,
    required: 'Please enter your name',
    trim: true,
  },
  password: {
    type: String,
    required: true
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User

