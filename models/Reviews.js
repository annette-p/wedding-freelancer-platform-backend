const MongoUtil = require("./MongoUtil");
const ObjectId = require("mongodb").ObjectId;

// read from .env file
require('dotenv').config();

// Retrieve the MongoDB url and DB name from environment variable, defined in .env file
let mongoUrl = process.env.MONGO_URL;
let dbName = process.env.MONGO_DBNAME;
let collectionName = "reviews";

// get all reviews for respective freelancer from DB
async function getByFreelancerId(freelancerId) {

    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).find({
            "for": ObjectId(freelancerId)
        }, {
            "rating": 1,
            "date": 1,
            "reviewer.name": 1,
            "description": 1
        }).toArray();
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


// add new review & comment to respective freelancer profile
async function addReview(freelancerId, newReview) {

    // to add a new "for" key with value as freelancer ID (tagging this new review to existing selected freelancer ID)
    newReview["for"] = ObjectId(freelancerId)

    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).insertOne(newReview);
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

// remove review & comment to respective freelancer profile
async function removeReview(reviewId) {
    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).deleteOne({
            '_id': ObjectId(reviewId)
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
    addReview, getByFreelancerId, removeReview
}