require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const connectDB = require("./src/config/db");
const typeDefs = require("./src/schema/typeDefs");
const resolvers = require("./src/schema/resolvers");

const app = express();
connectDB();

const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(() => {
  server.applyMiddleware({ app });
  app.listen(process.env.PORT, () =>
    console.log(
      `Server running at http://localhost:${process.env.PORT}/graphql`
    )
  );
});
