const express = require("express");
const cors = require("cors");
const Freelancers = require("./models/Freelancers");
const Logins = require("./models/Logins");
const Reviews = require("./models/Reviews");

let app = express();

// enable processing JSON data
app.use(express.json());

// enable CORS
app.use(cors());

async function main() {

    /* ........................................ Freelancer dataset collection ................................. */

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

            /* ............. validation .............  */

            if (req.body.type === undefined || req.body.type.trim().length === 0 || 
                req.body.specialized === undefined || !Array.isArray(req.body.specialized) || req.body.specialized.length === 0 || 
                req.body.rate === undefined || req.body.rate.trim().length === 0 || 
                req.body.rateUnit === undefined || req.body.rateUnit.trim().length === 0 ||
                req.body.name === undefined || req.body.name.trim().length === 0) {
    
                res.status(400);
                res.json({
                    "error": "One or more mandatory fields (Name, Type, Specialized, Rate, RateUnit) missing."
                });
                return;
            }

            if (Freelancers.isValidFreelancerType(req.body.type) === false) {
                res.status(400);
                res.json({
                    "error": `Invalid freelancer type. Valid types are ${Freelancers.validFreelancerTypes.join(", ")}.`
                });
                return;
            }

            if (Freelancers.isValidSpecializations(req.body.specialized) === false) {
                res.status(400);
                res.json({
                    "error": `Invalid specializations. Valid specializations are ${Freelancers.validSpecializations.join(", ")}.`
                });
                return;
            }

            if (req.body.contact.email === undefined || req.body.contact.email.trim().length === 0) {
                res.status(400);
                res.json({
                    "error": "Mandatory field (email) is missing."
                });
                return;
            }

            if (req.body.bio === undefined || req.body.bio.trim().length === 0) {
                res.status(400);
                res.json({
                    "error": "Mandatory field (bio) is missing."
                });
                return;
            }

            if (req.body.showCase === undefined || req.body.showCase.trim().length === 0) {
                res.status(400);
                res.json({
                    "error": "Mandatory field (showCase) is missing."
                });
                return;
            }

            /* ............. form processing .............  */

            let newFreelancerData = {
                "type": req.body.type,
                "specialized": req.body.specialized,
                "rate": parseInt(req.body.rate),
                "rateUnit": req.body.rateUnit,
                "name": req.body.name,
                "socialMedia": {},
                "contact": {
                    "email": req.body.contact.email
                },
                "bio": req.body.bio,
                "showCase": req.body.showCase,
                "portfolios": []
            }

            // Login details
            if (req.body.username !== undefined && req.body.username.trim().length > 0 &&
                req.body.password !== undefined && req.body.password.trim().length > 0) {
                newFreelancerData.username = req.body.username
                newFreelancerData.password = req.body.password
            }


            // profile image

            if (req.body.profileImage === undefined || req.body.profileImage.trim().length === 0) {
                newFreelancerData.profileImage = "https://images.unsplash.com/photo-1529335764857-3f1164d1cb24"
            } else {
                newFreelancerData.profileImage = req.body.profileImage
            }


            // social media
            if (req.body.socialMedia.facebook !== undefined && req.body.socialMedia.facebook.trim().length > 0) {
                newFreelancerData.socialMedia.facebook = req.body.socialMedia.facebook
            }

            if (req.body.socialMedia.instagram !== undefined && req.body.socialMedia.instagram.trim().length > 0) {
                newFreelancerData.socialMedia.instagram = req.body.socialMedia.instagram
            }

            if (req.body.socialMedia.tiktok !== undefined && req.body.socialMedia.tiktok.trim().length > 0)  {
                newFreelancerData.socialMedia.tiktok = req.body.socialMedia.tiktok
            }

            // contact 

            if (req.body.contact.mobile !== undefined && req.body.contact.mobile.trim().length >0) {
                newFreelancerData.contact.mobile = req.body.contact.mobile
            }

            if (req.body.contact.website !== undefined && req.body.contact.website.trim().length > 0) {
                newFreelancerData.contact.website = req.body.contact.website
            }

            /* ............. error handling .............  */

            // must be atleast 1 social media provide
            // Object.keys return an arrays of key in the object
            if (Object.keys(newFreelancerData.socialMedia).length < 1)  {
                res.status(400);
                res.json({
                "error": "Must provide at least one (facebook, instagram, tiktok) field."
                });
                return;       
            }

            // ref: https://stackoverflow.com/a/49718056
            let isOk = true;
            req.body.portfolios.some( (portfolio) => {
                if (portfolio.title !== undefined && portfolio.title.trim().length > 0 && 
                    portfolio.description !== undefined || portfolio.description.trim().length > 0 &&
                    portfolio.url !== undefined || portfolio.url.trim().length > 0) {
                    
                    newFreelancerData.portfolios.push(portfolio);
                    
                }
            })
            if (newFreelancerData.portfolios.length === 0) {
                res.status(400);
                res.json({
                    "error": "Must provide at least one portfolio"
                });
                return;
            }
            
            
            /* ............. end of error handling .............  */


            let result = await Freelancers.add(newFreelancerData);

            if (result !== null) {
                // inform the user that the process is successful
                res.status(201);
                res.send({
                    "success": true,
                    "message": "New freelancer profile added successfully",
                    "freelancerId": result.insertedId
                })
                return
                /*
                    {
                        "acknowledged": true,
                        "insertedId": "6166a1ba080db9e4a71918ee"
                    }
                */
            } else {
                res.status(500);
                res.json({
                    "error": "An interal server error encountered. New freelancer profile not added."
                });
                return;
            }
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
            let updatedFreelancerData = req.body;

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

    
    /* ........................................ Review dataset collection ................................... */

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
        /*
            structure of a review:
            {
                "date": <system_date_time>,
                "for": <objectId_of_freelancer>,
                "reviewer": {
                    "name": "string_compulsory",
                    "email": "string_optional",
                    "tag": "anonymous"
                },
                "rating": <numeric_1_to_5>,
                "recommend": <bool>,
                "description": <string_compulsory>
            }
        */

        if (req.body.reviewerName === undefined || 
            req.body.rating === undefined || 
            req.body.recommend === undefined || 
            req.body.description === undefined) {

            res.status(400);
            res.json({
                "error": "One or more mandatory fields (description, reviewerName, rating, recommend) missing."
            });
            return;

        }

        if (req.body.recommend !== "true" && req.body.recommend !== "false") {
            res.status(400);
            res.json({
                "error": "'recommend' should be a boolean (i.e. true or false)"
            });
            return;
        }
        
        if (isNaN(req.body.rating) || parseInt(req.body.rating) < 0 || parseInt(req.body.rating) > 5) {
            res.status(400);
            res.json({
                "error": "'rating' should be numeric, between 1 to 5"
            });
            return;
        }

        let newReviewData = {
            "reviewer": {
                "name": req.body.reviewerName
            },
            "description": req.body.description,
            "rating": parseInt(req.body.rating),
            "recommend": req.body.recommend === "true",
        }

        if (req.body.email !== undefined) {
            newReviewData.reviewer.email = req.body.email
        }

        let freelancerId = req.params.id;   // retrieve freelancer ID

        try {
            let result = await Reviews.addReview(freelancerId, newReviewData);

            if (result !== null) {
                // inform the user that the process is successful
                res.status(201);
                res.send({
                    "success": true,
                    "message": "New review added successfully"
                })
                return
                /*
                    {
                        "acknowledged": true,
                        "insertedId": "6166a1ba080db9e4a71918ee"
                    }
                */
            } else {
                res.status(500);
                res.json({
                    "error": "An interal server error encountered. New review not added."
                });
                return;
            }

        } catch (e) {
            const statusCode = e.statusCode === undefined ? 500 : e.statusCode
            const errorMessage = e.message === undefined ? "We have encountered an interal server error. Please contact admin" : e.message
            res.status(statusCode);
            res.json({
                'error': errorMessage
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


    /* ........................................ Login dataset collection ................................... */

    // new login registration
    app.post('/login', async (req, res) => {
        try {
            const username = req.body.username;
            const password = req.body.password;

            if (username === undefined || password === undefined) {
                res.status(400);
                res.json({
                    "error": "Missing username and/or password"
                });
                return;
            }

            let loginResult = await Logins.verify(username, password);
            // check in logins collection DB if the username/password exist using verify function
            if (loginResult !== null) {
                // take that _id in logins collection DB, look into freelancer collection DB to find the freelancer that hold that login _id (under "login" key)
                let authenticatedFreelance = await Freelancers.get(
                    {
                        "login": loginResult._id
                    },
                    {
                        "projection": {
                            "login": 0,
                            "date": 0
                        }
                    }
                )

                // verify if there's freelancer with this login provided (able to find in freelancer collection DB)
                if (authenticatedFreelance !== null) {
                    // inform the user that the process is successful
                    res.status(200);
                    res.json({
                        "success": true,
                        "freelancer": authenticatedFreelance
                    });
                    return;
                } 
            }

            // there's no full match (either) username/password in logins collection DB, or
            // no freelancer with this login provided (unable to find in freelancer collection DB)
            res.status(401);
            res.json({
                "error": "Login failed"
            });

        } catch (e) {
            res.status(500);
            res.json({
                'error': "We have encountered an interal server error. Please contact admin"
            });
            console.error(e);
        }
    })

    // change password
    app.put('/change-password', async (req, res) => {
        let username = req.body.username;
        let currentPassword = req.body.currentPassword;
        let newPassword = req.body.newPassword;

        if (username === undefined || currentPassword === undefined || newPassword === undefined) {
            res.status(400);
            res.json({
                "error": "Missing username, current password and/or new password"
            });
            return;
        }

        try {
            let result = await Logins.changePassword(username, currentPassword, newPassword)
            if (result.matchedCount === 1 && result.modifiedCount === 1) {
                res.status(200);
                res.send({
                    "success": true,
                    "message": "Password changed successfully"
                })
                return;
            } else {
                res.status(400);
                res.json({
                    "error": "Password not changed successfully"
                });
                return;
            }
        } catch (e) {
            const statusCode = e.statusCode === undefined ? 500 : e.statusCode
            const errorMessage = e.message === undefined ? "We have encountered an interal server error. Please contact admin" : e.message
            res.status(statusCode);
            res.json({
                'error': errorMessage
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
