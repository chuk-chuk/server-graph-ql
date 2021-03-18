const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Comment {
    _id: ID!
    text: String!
    postedBy: User!
    createdAt: String!
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    comments: [Comment]
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    name: String!
    password: String!
    createdAt: String!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type PostData {
    posts: [Post]!
    totalPosts: Int!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
    posts(page: Int): PostData!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);


