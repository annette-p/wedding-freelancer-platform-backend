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

module.exports = { connect, getDB }