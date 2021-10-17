const MongoUtil = require("./MongoUtil");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require('bcryptjs');

// read from .env file
require('dotenv').config();

// Retrieve the MongoDB url and DB name from environment variable, defined in .env file
let mongoUrl = process.env.MONGO_URL;
let dbName = process.env.MONGO_DBNAME;
let collectionName = "logins";

// to get login by user name (includePassword=false is an optional argument)
async function getByUsername(username, includePassword=false) {

    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let findOption = {
            // to set default projection
            "projection": {
                "username": 1
            }
        }
        // optional when requested
        if (includePassword) {
            findOption.projection.password = 1
        }
        let result = await db.collection(collectionName).findOne({
            'username': username
        }, findOption);
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when querying from DB.
        DB: ${dbName}, Collection: ${collectionName}, Freelancer Id: ${freelancerId}, Error: ${e}
        `;
        console.error(errorMsg);
        throw errorMsg;
    }
}

// new registration
async function register(username, password) {

    // check whether user exists
    let existingUser = await getByUsername(username);
    if (existingUser !== null) {
        throw `Unable to register new user. Username ${username} already exists`;
    }

    // generate a salt, and use bcrypt.hash to encrypt the provided password
    let salt = await bcrypt.genSalt(10);
    let encryptedPassword = await bcrypt.hash(password, salt);
    let newLogin = {
        username: username,
        password: encryptedPassword
    }
    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).insertOne(newLogin);
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when inserting registration data into DB.
        DB: ${dbName}, Collection: ${collectionName}, Error: ${e}
        `;
        console.error(errorMsg);
        throw errorMsg;
    }
}

// verify the credentials
async function verify(username, password) {
    // this time pass 2 arguments which is including password as true)
    let user = await getByUsername(username, true);
    // compare password provided by user with the one in DB
    if (user !== null && await bcrypt.compare(password, user.password) === true) {
        // remove the encrypted password that was retrieved from DB
        delete user.password
        return user;
    } else {
        return null;
    }
}

// change password
async function changePassword(username, currentPassword, newPassword) {

    // check whether username and current password is correct
    let user = await verify(username, currentPassword);
    if (user === null) {
        throw `Unable to change password. Username ${username} does not exists or current password incorrect`;
    }

    // generate a salt, and use bcrypt.hash to encrypt the provided password
    let salt = await bcrypt.genSalt(10);
    let newEncryptedPassword = await bcrypt.hash(newPassword, salt);
    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).updateOne({
            '_id': user._id
        },{
            '$set': {
                password: newEncryptedPassword
            }
        });
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when updating registration data in DB.
        DB: ${dbName}, Collection: ${collectionName}, Login Id: ${user._id.str}, Username: ${username}, Error: ${e}
        `;
        console.error(errorMsg);
        throw errorMsg;
    }
}

async function remove(id) {
    try {
        let db = await MongoUtil.connect(mongoUrl, dbName);
        let result = await db.collection(collectionName).deleteOne({
            '_id': ObjectId(id)
        });
        return result;
    } catch(e) {
        errorMsg = `
        Error encountered when removing registration data from DB.
        DB: ${dbName}, Collection: ${collectionName}, Login Id: ${user._id.str}, Username: ${username}, Error: ${e}
        `;
        console.error(errorMsg);
        throw errorMsg;
    }
}

module.exports = {
    changePassword, getByUsername, register, remove, verify
}