const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const { graphqlHTTP } = require('express-graphql')
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const dotenv = require('dotenv')
const mongoose = require("mongoose")

mongoose.Promise = global.Promise

dotenv.config()

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true
}))

app.use((error, req, res, next) => {
  console.log(error)
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(status).json({ message: message, data: data})
})

mongoose.set('useCreateIndex', true)

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    .then(() => {
        console.log('MongoDB connected successfully')
        app.listen(process.env.PORT, () => console.log('Express GraphQL Server is running on localhost:4000/graphql'))
    })
    .catch((error) => {
        console.error(error || 'Error while connecting to MongoDB');
    })
