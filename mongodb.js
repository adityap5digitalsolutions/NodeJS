const { MongoClient } = require("mongodb");
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "e-comm";

async function dbConnect() {
  let result = await client.connect();
  let db = result.db(dbName);
  return db.collection("products");
}

module.exports = dbConnect;
