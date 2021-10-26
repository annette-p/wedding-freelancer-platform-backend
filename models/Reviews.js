const MongoUtil = require("./MongoUtil");
const ObjectId = require("mongodb").ObjectId;

let collectionName = "reviews";

// get all reviews for respective freelancer from DB
async function getByFreelancerId(db, freelancerId) {

    try {
        let result = await db.collection(collectionName).find({
            "for": ObjectId(freelancerId)
        }, {
            "projection": {
                "date": 1,
                "for": 1,
                "rating": 1,
                "reviewer.name": 1,
                "description": 1,
                "recommend": 1
            }       
        }).toArray();
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when querying from DB.
        Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw new MongoUtil.DBError(errorMsg);
    }
}


// add new review & comment to respective freelancer profile
async function addReview(db, freelancerId, newReview) {

    // to add a new "for" key with value as freelancer ID (tagging this new review to existing selected freelancer ID)
    newReview["for"] = ObjectId(freelancerId)
    newReview["date"] = new Date();  // the datetime default to NOW -- current date time
    newReview["reviewer"]["tag"] = "anonymous";

    try {
        // let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).insertOne(newReview);
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when inserting data into DB.
        Collection: ${collectionName}, Error: ${e}
        `
        console.error(errorMsg)
        throw new MongoUtil.DBError(errorMsg);
    }
}

// remove review & comment to respective freelancer profile
async function removeReview(db, reviewId) {
    try {
        // let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).deleteOne({
            '_id': ObjectId(reviewId)
        });
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when removing data from DB.
        Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw new MongoUtil.DBError(errorMsg);
    }
}

// remove review & comment for a freelancer
async function removeReviewForFreelancer(db, freelancerId) {
    try {
        // let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).deleteMany({
            'for': ObjectId(freelancerId)
        });
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when removing data from DB.
        Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw new MongoUtil.DBError(errorMsg);
    }
}

// https://stackify.com/node-js-error-handling/
class ReviewError extends Error {
    constructor(args) {
        super(args)
        this.name = "ReviewError"
        this.statusCode = 400
    }
}

module.exports = {
    addReview, getByFreelancerId, removeReview, removeReviewForFreelancer, ReviewError
}
