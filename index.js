const express = require("express");
const cors = require("cors");
const Freelancers = require("./models/Freelancers")

let app = express();

// enable processing JSON data
app.use(express.json());

// enable CORS
app.use(cors());

async function main() {

    // retrieve list of freelancers
    app.get('/freelancers', async (req, res) => {

        try {

            // ** NOT IMPLEMENTED YET - FUTURE SEARCH **
            // start with an empty critera object
            let criteria = {};

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

            let result = await Freelancers.get(criteria);

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
            // req.body is an object that contains the
            // data sent to the express endpoint
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

    // get all reviews for a freelancer
    app.get('/freelancer/:id/reviews', async (req, res) => {})

    // get a review for a freelancer
    app.get('/freelancer/:id/review/:id', async (req, res) => {})

    // delete a review for a freelancer
    app.delete('/freelancer/:id/review/:id', async (req, res) => {})
}

main();

// start server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server has started on port ${port}`)
});
