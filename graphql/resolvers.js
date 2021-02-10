
const User = require('../models/user')
const bcrypt = require('bcryptjs')

module.exports = {
  hello: () => {
    return {
      text: 'Hello World!',
      views: 1234
    }
  },

  createUser: async ({ userInput }, req) =>  {
    // const email = args.userInput.email
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

    return {...createdUser._doc, _id: createdUser._id}
  }
}

