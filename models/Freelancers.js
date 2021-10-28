const ObjectId = require("mongodb").ObjectId;
const Logins = require("./Logins")

let collectionName = "freelancers";


const validFreelancerTypes = [
    "makeup-artist", "photographer", "videographer"
]

const validSpecializations = [
    "bridal-makeup",
    "fancy-makeup",
    "natural-glow-makeup",
    "pre-wedding",
    "photography",
    "videography",
    "wedding-day-rom",
    "maternity",
    "newborn"
]

// get all freelancers from DB
async function get(db, query, projection) {

    try {
        // let db = await MongoUtil.connect(mongoUrl, dbName);
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

async function getById(db, freelancerId) {

    try {
        // let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).findOne({
            '_id': ObjectId(freelancerId)
        });
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when querying from DB.
        Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

async function add(db, freelancer) {

    // User Login Registration

    // username provided but not password
    if (freelancer.hasOwnProperty("username") && !freelancer.hasOwnProperty("password")) {
        errorMsg = `Password not provided`
        throw errorMsg
    }

    // password provided but not username
    if (freelancer.hasOwnProperty("password") && !freelancer.hasOwnProperty("username")) {
        errorMsg = `Username not provided`
        throw errorMsg
    }

    // if username/password provided, register the login first
    if (freelancer.hasOwnProperty("username") && freelancer.hasOwnProperty("password")) {

        try {
            let registeredLogin = await Logins.register(db, freelancer.username, freelancer.password)
            if (registeredLogin !== null) {
                // Registration successful

                // login details is already stored separately in another "login" collection
                // hence removing them so that they will not be in "freelancers" collection
                delete freelancer.username
                delete freelancer.password

                // tag the login unique id to the freelancer
                freelancer.login = registeredLogin.insertedId
            } else {
                throw "Registration failed"
            }
        } catch (e) {
            throw e;
        }
        
    }

    freelancer["date"] = new Date();  // the datetime default to NOW -- current date time
    try {
        // let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).insertOne(freelancer);
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when inserting data into DB.
        Collection: ${collectionName}, Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

async function update(db, freelancerId, updatedFreelancerInfo) {
    try {
        let result = await db.collection(collectionName).updateOne({
            '_id': ObjectId(freelancerId)
        },{
            '$set': updatedFreelancerInfo
        });
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when updating data in DB.
        Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

async function remove(db, freelancerId) {
    try {
        // let db = await MongoUtil.connect(mongoUrl, dbName);
        let freelancer = await getById(db, freelancerId);
        // check if the freelancer has login and if it is valid format
        if (freelancer.hasOwnProperty("login") && ObjectId.isValid(freelancer.login)) {
            // freelancer has a login associated, proceed to delete
            let _result = await Logins.remove(db, freelancer.login);
            // notify that the login record don't exist but did not abort the operation
            if (_result.deletedCount !== 1) {
                console.error(`Failed to delete login record for Freelancer ID ${freelancerId}, Login ID ${freelancer.login}`)
            }
        }
        let result = await db.collection(collectionName).deleteOne({
            '_id': ObjectId(freelancerId)
        });
        return result
    } catch(e) {
        errorMsg = `
        Error encountered when removing data from DB.
        Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `
        console.error(errorMsg)
        throw errorMsg
    }
}

function isValidFreelancerType(typeOfFreelancer) {
    return validFreelancerTypes.indexOf(typeOfFreelancer) >= 0;
}

function isValidSpecializations(specializations) {
    specializations.map( specialization => {
        if (validSpecializations.indexOf(specialization) < 0) {
            return false
        }
    })
    return true;
}

module.exports = {
    add, get, getById, remove, update,
    isValidFreelancerType, isValidSpecializations,
    validFreelancerTypes, validSpecializations
}