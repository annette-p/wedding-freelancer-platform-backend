const MongoUtil = require("./MongoUtil");
const ObjectId = require("mongodb").ObjectId;

// read from .env file
require('dotenv').config();

// Retrieve the MongoDB url and DB name from environment variable, defined in .env file
let mongoUrl = process.env.MONGO_URL;
let dbName = process.env.MONGO_DBNAME;
let collectionName = "freelancers";


// get all freelancers from DB
async function get(query) {

    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).find(query).toArray();
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when querying from DB.
        DB: ${dbName}, Collection: ${collectionName}, Query: "${query}"", Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

async function getById(freelancerId) {

    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).findOne({
            '_id': ObjectId(freelancerId)
        });
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when querying from DB.
        DB: ${dbName}, Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

async function add(freelancer) {
    console.log(freelancer)
    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).insertOne(freelancer);
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when inserting data into DB.
        DB: ${dbName}, Collection: ${collectionName}, Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

async function update(freelancerId, updatedFreelancerInfo) {
    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).updateOne({
            '_id': ObjectId(freelancerId)
        },{
            '$set': updatedFreelancerInfo
        });
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when updating data in DB.
        DB: ${dbName}, Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

async function remove(freelancerId) {
    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).deleteOne({
            '_id': ObjectId(freelancerId)
        });
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when removing data from DB.
        DB: ${dbName}, Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

module.exports = {
    add, get, getById, remove, update
}