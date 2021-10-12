const express = require("express");

let app = express()

// routes - mapping of a URL to a function.
app.get('/', function(req,res){
    res.send("<h1>Hello from Express</h1>");
})



app.listen(3000, ()=>{
    console.log("Server started")
})
