const express = require('express')
const path = require('path')
const { graphqlHTTP } = require('express-graphql')
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const auth = require('./middleware/auth')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Logger = require('./logger')

mongoose.Promise = global.Promise

dotenv.config()

const app = express()

app.get("/logger", (_, res) => {
  Logger.error("This is an error log");
  Logger.warn("This is a warn log");
  Logger.info("This is a info log");
  Logger.http("This is a http log");
  Logger.debug("This is a debug log");

  res.send("Hello world");
});

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader("Content-Type", "application/json");
  // allow other options, not only post / get
  if (req.method === "OPTIONS") {
    return res.sendStatus(200)
  }
  next();
});

app.use(auth)

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  customFormatErrorFn(err) {
    if(!err.originalError){
      return err
    }
    const data = err.originalError.data
    const message = err.message || "An error occurred"
    const code = err.originalError.code || 500

    return { message: message, status: code, data: data }
  }
}))

app.use((error, req, res, next) => {
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
        Logger.info('MongoDB connected successfully');
        app.listen(process.env.PORT, () => Logger.info('Express GraphQL Server is running on localhost:4000/graphql'))
    })
    .catch((error) => {
        Logger.error(error || 'Error while connecting to MongoDB');
    })
