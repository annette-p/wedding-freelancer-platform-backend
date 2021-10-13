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

    console.log(freelancerId)

    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).find({
            "for._id": ObjectId(freelancerId)
        }, {
            "rating": 1,
            "date": 1,
            "reviewer.name": 1,
            "description": 1
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

module.exports = {
    getByFreelancerId
}