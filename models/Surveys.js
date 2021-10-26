const MongoUtil = require("./MongoUtil");
const ObjectId = require("mongodb").ObjectId;

let collectionName = "surveys";

// get all surveys from DB
async function get(db, query, projection) {

    try {
        let result = await db.collection(collectionName).find(query, projection).toArray();
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when querying from DB.
        Collection: ${collectionName}, Query: "${query}"", Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}


// add new review & comment to respective freelancer profile
async function add(db, newSurvey) {
    newSurvey["date"] = new Date();  // the datetime default to NOW -- current date time

    try {
        let result = await db.collection(collectionName).insertOne(newSurvey);
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


module.exports = {
    add, get
}
