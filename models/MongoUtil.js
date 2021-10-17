const MongoClient = require('mongodb').MongoClient;

// declare a global variable to store a reference to database
let _db; 

async function connect(uri, dbname) {
    const client = new MongoClient(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    await client.connect();
    _db = client.db(dbname);
    return _db;
}

function getDB() {
    return _db;
}

// https://stackify.com/node-js-error-handling/
class DBError extends Error {
    constructor(args) {
        super(args)
        this.name = "DBError"
        this.statusCode = 500
    }
}

module.exports = { connect, getDB, DBError }