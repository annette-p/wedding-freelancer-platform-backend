const express = require("express");
const cors = require("cors");
const Freelancers = require("./models/Freelancers");
const Logins = require("./models/Logins")
const Reviews = require("./models/Reviews");

let app = express();

// enable processing JSON data
app.use(express.json());

// enable CORS
app.use(cors());

async function main() {

    /* ........................ Freelancer dataset collection................................. */

    // retrieve list of freelancers
    app.get('/freelancers', async (req, res) => {

        try {

            // ** NOT IMPLEMENTED YET - FUTURE SEARCH **
            // start with an empty critera object
            let criteria = {};
            let projection = { 
                'projection': {} 
            }

            // we fill in the critera depending on whether specific
            // query string keys are provided

            // if the `type` key exists in req.query
            if (req.query.type) {
                criteria['type'] = {
                    'type': req.query.type,
                    '$options': 'i'
                }
            }

            if (req.query.specialized) {
                criteria['specialized'] = {
                    '$in': [req.query.specialized]
                }
            }

            // ** END OF NOT IMPLEMENTED **

            let result = await Freelancers.get(criteria, projection);

            res.status(200);
            res.send(result);
        } catch (e) {
            res.status(500);
            res.send({
                'error':"We have encountered an internal server error"
            })
            console.error(e);      
        }
    })

    // get freelancer by id
    app.get('/freelancer/:id', async(req,res)=>{
        try {
            let result = await Freelancers.getById(req.params.id)
            res.status(200);
            res.send(result)
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })

    // add freelancer
    app.post('/freelancer', async (req, res) => {
        try {
            // req.body is an object that contains the data sent to the express endpoint
            /*
                {
                 "data": {data of freelancer}
                }
            */
            let freelancerData = req.body.data;

            let result = await Freelancers.add(freelancerData);

            // inform the client that the process is successful
            res.status(200);
            res.json(result);
            /*
            {
                "acknowledged": true,
                "insertedId": "616661b1d29fa9bc58c8b97d"
            }
            */
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })

    // edit & update freelancer
    app.put('/freelancer/:id', async(req,res)=>{
        try {
            // req.body is an object that contains the data sent to the express endpoint
            let updatedFreelancerData = req.body.data;

            let result = await Freelancers.update(req.params.id, updatedFreelancerData)
            res.status(200);
            res.send(result)
            /*
            the update test result: 
                {
                    "acknowledged": true,
                    "modifiedCount": 1,
                    "upsertedId": null,
                    "upsertedCount": 0,
                    "matchedCount": 1
                }
            */
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })

    // delete freelancer
    app.delete('/freelancer/:id', async(req,res) => {
        try {
            let results = await Freelancers.remove(req.params.id)
            res.status(200);
            res.send(results);
            /*
            sucessful response: 
                {
                    "acknowledged": true,
                    "deletedCount": 1
                }
            */
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })

    /* ........................ Review dataset collection................................. */

    // get all reviews for a freelancer by freelancer ID
    app.get('/freelancer/:id/reviews', async (req, res) => {
        try {
            let result = await Reviews.getByFreelancerId(req.params.id)
            res.status(200);
            res.send(result)
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })

    // create new review for a freelancer from each respective freelancer profile
    app.post('/freelancer/:id/review', async (req, res) => {
        try {
            // req.body is an object that contains the data sent to the express endpoint
            let newReviewData = req.body.data;
            let freelancerId = req.params.id;   // retrieve freelancer ID

            let result = await Reviews.addReview(freelancerId, newReviewData);

            // inform the client that the process is successful
            res.status(200);
            res.json(result);
            /*
                {
                    "acknowledged": true,
                    "insertedId": "6166a1ba080db9e4a71918ee"
                }
            */

        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })


    /* De-activate the delete function for review at this moment >> only will allow the admin access in the future to perform this task */ 
    // delete a review for a freelancer
    // app.delete('/freelancer/:id/review/:id', async (req, res) => {
    //     try {
    //         let results = await Reviews.removeReview(req.params.id)
    //         res.status(200);
    //         res.send(results);
    //         /*
    //         {
    //             "acknowledged": true,
    //             "deletedCount": 1
    //         }
    //         */

    //     } catch (e) {
    //         res.status(500);
    //         res.json({
    //             'error': "We have encountered an interal server error. Please contact admin"
    //         });
    //         console.error(e);
    //     }
    // })


    // new login registration
    app.post('/login', async (req, res) => {
        try {
            const username = req.body.username;
            const password = req.body.password;

            let result = await Logins.verify(username, password);

            if (result !== null) {
                let result2 = await Freelancers.get(
                    {
                        "login": result._id
                    },
                    {
                        "projection": { "_id": 1 }
                    }
                )

                if (result2 !== null) {
                    // inform the client that the process is successful
                    res.status(200);
                    res.json(result2);
                } else {
                    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
                    res.status(401)
                    res.json({
                        "error": "Login failed"
                    })
                }
            } else {
                // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
                res.status(401)
                res.json({
                    "error": "Login failed"
                })
            }

        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })

    app.put('/change-password', async (req, res) => {
        try {
            let username = req.body.username;
            let currentPassword = req.body.currentPassword;
            let newPassword = req.body.newPassword;

            let result = await Logins.changePassword(username, currentPassword, newPassword)
            res.status(200);
            res.send(result)
        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })

}

main();

// start server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server has started on port ${port}`)
});
