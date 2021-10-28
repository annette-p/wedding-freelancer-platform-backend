const express = require("express");
const cors = require("cors");
const MongoUtil = require("./models/MongoUtil");
const Freelancers = require("./models/Freelancers");
const Logins = require("./models/Logins");
const Reviews = require("./models/Reviews");
const Survery = require("./models/Surveys")

// read from .env file
require('dotenv').config();

// Retrieve the MongoDB url and DB name from environment variable, defined in .env file
let mongoUrl = process.env.MONGO_URL;
let dbName = process.env.MONGO_DBNAME;

let app = express();

// enable processing JSON data
app.use(express.json());

// enable CORS
app.use(cors());

// Ref: https://stackoverflow.com/a/51629852
app.use(function (error, req, res, next) {
    // Handle SyntaxError
    if (error instanceof SyntaxError) { 
        return res.status(error.statusCode).send({"error" : "Invalid data"});
    } else {
        next();
    }
});

async function main() {

    // connect to the MongoDB, and save the reference in "db" variable
    let db = await MongoUtil.connect(mongoUrl, dbName);

    errorHandling = (err, res) => {
        const statusCode = err.statusCode === undefined ? 500 : err.statusCode
        const errorMessage = err.message === undefined ? "We have encountered an interal server error. Please contact admin" : err.message
        res.status(statusCode);
        res.json({
            'error': errorMessage
        });
        console.error(err);
    }

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

            if (req.query.searchText) {
                // '$or' >> is to match search criteria across multiple fields in db  
                criteria['$or'] = []
                // split the search text by spaces
                req.query.searchText.split(" ").forEach( searchWord => {
                    // ignore spaces, and handle search text
                    if (searchWord.trim().length > 0) {
                        singleSearchCriteria = [
                            {
                            "name": {
                                "$regex": searchWord,
                                "$options": "i"
                            }
                            },
                            {
                            "bio": {
                                "$regex": searchWord,
                                "$options": "i"
                            }
                            },
                            {
                                "portfolios": {
                                "$elemMatch": {
                                    "title": {
                                    "$regex": searchWord,
                                    "$options": "i"
                                    }
                                }
                                }
                            },
                            {
                            "portfolios": {
                                "$elemMatch": {
                                "description": {
                                    "$regex": searchWord,
                                    "$options": "i"
                                }
                                }
                            }
                            }
                        ]
                        criteria['$or'] = criteria['$or'].concat(singleSearchCriteria)
                    }
                    
                } )
                
            }
            
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

            let result = await Freelancers.get(db, criteria, projection);

            res.status(200);
            res.send(result);
        } catch (e) {
            errorHandling(e, res);     
        }
    })

    // get freelancer by id
    app.get('/freelancer/:id', async(req,res)=>{
        try {
            let result = await Freelancers.getById(db, req.params.id)
            res.status(200);
            res.send(result)
        } catch (e) {
            errorHandling(e, res);
        }
    })

    // add freelancer
    app.post('/freelancer', async (req, res) => {
        try {

            /* ............. validation .............  */

            if (!req.body.type || req.body.type.trim().length === 0 || 
                !req.body.rate || req.body.rate.trim().length === 0 || 
                !req.body.rateUnit || req.body.rateUnit.trim().length === 0 || 
                !req.body.name || req.body.name.trim().length === 0 ||
                !req.body.specialized || !Array.isArray(req.body.specialized) || req.body.specialized.length === 0) {
    
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

            if (req.body.specialized.length > 6) {
                res.status(400);
                res.json({
                    "error": "Only maximum 6 specializations permitted"
                });
                return;
            }

            if (isNaN(req.body.rate)) {
                res.status(400);
                res.json({
                    "error": "'rate' should be numeric"
                });
                return;
            }

            if (!req.body.contact.email || req.body.contact.email.trim().length === 0) {
                res.status(400);
                res.json({
                    "error": "Mandatory field (email) is missing."
                });
                return;
            }

            if (!req.body.bio || req.body.bio.trim().length === 0) {
                res.status(400);
                res.json({
                    "error": "Mandatory field (bio) is missing."
                });
                return;
            }

            if (!req.body.showCase || req.body.showCase.trim().length === 0) {
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
            if (req.body.username && req.body.username.trim().length > 0 &&
                req.body.password && req.body.password.trim().length > 0) {
                newFreelancerData.username = req.body.username
                newFreelancerData.password = req.body.password
            }

            // profile image
            if (!req.body.profileImage || req.body.profileImage.trim().length === 0) {
                newFreelancerData.profileImage = "https://images.unsplash.com/photo-1529335764857-3f1164d1cb24"
            } else {
                newFreelancerData.profileImage = req.body.profileImage
            }

            // social media

            if (req.body.socialMedia.facebook && req.body.socialMedia.facebook.trim().length > 0) {
                newFreelancerData.socialMedia.facebook = req.body.socialMedia.facebook
            }

            if (req.body.socialMedia.instagram && req.body.socialMedia.instagram.trim().length > 0) {
                newFreelancerData.socialMedia.instagram = req.body.socialMedia.instagram
            }

            if (req.body.socialMedia.tiktok && req.body.socialMedia.tiktok.trim().length > 0)  {
                newFreelancerData.socialMedia.tiktok = req.body.socialMedia.tiktok
            }

            // contact 
            
            if (req.body.contact.mobile && req.body.contact.mobile.trim().length >0) {
                newFreelancerData.contact.mobile = req.body.contact.mobile
            }

            if (req.body.contact.website && req.body.contact.website.trim().length > 0) {
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
                if (portfolio.title && portfolio.title.trim().length > 0 && 
                    portfolio.description && portfolio.description.trim().length > 0 &&
                    portfolio.url && portfolio.url.trim().length > 0) {
                    
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


            let result = await Freelancers.add(db, newFreelancerData);

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
            errorHandling(e, res);
        }
    })

    // edit & update freelancer
    app.put('/freelancer/:id', async(req,res)=>{

        /* ............. validation .............  */

        if (!req.body.type || req.body.type.trim().length === 0 || 
            !req.body.rate || req.body.rate.trim().length === 0 || 
            !req.body.rateUnit || req.body.rateUnit.trim().length === 0 || 
            !req.body.name || req.body.name.trim().length === 0 ||
            !req.body.specialized || !Array.isArray(req.body.specialized) || req.body.specialized.length === 0) {

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

        if (req.body.specialized.length > 6) {
            res.status(400);
            res.json({
                "error": "Only maximum 6 specializations permitted"
            });
            return;
        }

        if (isNaN(req.body.rate)) {
            res.status(400);
            res.json({
                "error": "'rate' should be numeric"
            });
            return;
        }

        if (!req.body.contact.email || req.body.contact.email.trim().length === 0) {
            res.status(400);
            res.json({
                "error": "Mandatory field (email) is missing."
            });
            return;
        }

        if (!req.body.bio || req.body.bio.trim().length === 0) {
            res.status(400);
            res.json({
                "error": "Mandatory field (bio) is missing."
            });
            return;
        }

        if (!req.body.showCase || req.body.showCase.trim().length === 0) {
            res.status(400);
            res.json({
                "error": "Mandatory field (showCase) is missing."
            });
            return;
        }

        /* ............. form processing .............  */

        let updatedFreelancerData = {
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

        // profile image
        if (!req.body.profileImage || req.body.profileImage.trim().length === 0) {
            updatedFreelancerData.profileImage = "https://images.unsplash.com/photo-1529335764857-3f1164d1cb24"
        } else {
            updatedFreelancerData.profileImage = req.body.profileImage
        }

        // social media

        if (req.body.socialMedia.facebook && req.body.socialMedia.facebook.trim().length > 0) {
            updatedFreelancerData.socialMedia.facebook = req.body.socialMedia.facebook
        }

        if (req.body.socialMedia.instagram && req.body.socialMedia.instagram.trim().length > 0) {
            updatedFreelancerData.socialMedia.instagram = req.body.socialMedia.instagram
        }

        if (req.body.socialMedia.tiktok && req.body.socialMedia.tiktok.trim().length > 0)  {
            updatedFreelancerData.socialMedia.tiktok = req.body.socialMedia.tiktok
        }

        // contact 
        
        if (req.body.contact.mobile && req.body.contact.mobile.trim().length >0) {
            updatedFreelancerData.contact.mobile = req.body.contact.mobile
        }

        if (req.body.contact.website && req.body.contact.website.trim().length > 0) {
            updatedFreelancerData.contact.website = req.body.contact.website
        }

        /* ............. error handling .............  */

        // must be atleast 1 social media provide
        // Object.keys return an arrays of key in the object
        if (Object.keys(updatedFreelancerData.socialMedia).length < 1)  {
            res.status(400);
            res.json({
            "error": "Must provide at least one (facebook, instagram, tiktok) field."
            });
            return;       
        }

        // ref: https://stackoverflow.com/a/49718056
        let isOk = true;
        req.body.portfolios.some( (portfolio) => {
            if (portfolio.title && portfolio.title.trim().length > 0 && 
                portfolio.description && portfolio.description.trim().length > 0 &&
                portfolio.url && portfolio.url.trim().length > 0) {
                
                    updatedFreelancerData.portfolios.push(portfolio);
                
            }
        })
        if (updatedFreelancerData.portfolios.length === 0) {
            res.status(400);
            res.json({
                "error": "Must provide at least one portfolio"
            });
            return;
        }
        
        try {
            let result = await Freelancers.update(db, req.params.id, updatedFreelancerData);

            if (result !== null && result.matchedCount === 1) {
                // inform the user that the process is successful
                let msg = result.modifiedCount === 0 ? "No changes required for Freelancer profile" : "Freelancer profile updated"
                res.status(200);
                res.send({
                    "success": true,
                    "message": msg,
                    "freelancerId": req.params.id
                })
                return
                /*
                    -> SUCCESS no modification

                    {
                        "acknowledged": true,
                        "modifiedCount": 0,
                        "upsertedId": null,
                        "upsertedCount": 0,
                        "matchedCount": 1
                    }

                    -> SUCCESS with modification

                    {
                        "acknowledged": true,
                        "modifiedCount": 1,
                        "upsertedId": null,
                        "upsertedCount": 0,
                        "matchedCount": 1
                    }
                */
            } else {
                res.status(400);
                res.json({
                    "error": "Unsuccessful update. Unable to locate freelancer profile."
                });
                return;

                /*
                    -> Unable to find the freelancer record in DB

                    {
                        "acknowledged": true,
                        "modifiedCount": 0,
                        "upsertedId": null,
                        "upsertedCount": 0,
                        "matchedCount": 0
                    }
                */
            }
        } catch (e) {
            errorHandling(e, res);
        }
    })

    // delete freelancer
    app.delete('/freelancer/:id', async(req,res) => {
        // prepare survey data to be added
        let surveyData = {
            "category": "account deletion",
            "response": {
                "reasonToLeave": req.body.reasonToLeave,
            }
        }
        if (req.body.additionalInfo) {
            surveyData.response.additionalInfo = req.body.additionalInfo
        }

        try {
            // get freelance whole object 
            let freelancer = await Freelancers.getById(db, req.params.id)
            if (freelancer) {
                // to get the _id of the login in freelance collection
                let loginIdResult = await Logins.getUsernameById(db, (freelancer.login).toString())
                if (loginIdResult) {
                    // found > varify the username (retrieved frm db) with password provided by user
                    let loginResult = await Logins.verify(db, loginIdResult.username, req.body.password);
                    if (loginResult !== null) {
                        // authentication success > delete freelance, all related reivews, collect survey
                        let deleteFreelancerResult = await Freelancers.remove(db, req.params.id)
                        let deleteReviewsResult = await Reviews.removeReviewForFreelancer(db, req.params.id)
                        let addSurveyResult = await Survery.add(db, surveyData)

                        // to confirm 1 record of freelancer was deleted
                        if (deleteFreelancerResult.deletedCount === 1) {
                            res.status(200);
                            res.json({
                                "success": true,
                                "message": "Freelancer profile deleted successfully",
                                "freelancerId": req.params.id
                            });
                            return;
                            /*
                            sucessful response: 
                                {
                                    "acknowledged": true,
                                    "deletedCount": 1
                                }
                            */
                        }
                    }
                }
            }

            res.status(400);
            res.json({
                "error": "Unable to delete freelancer profile",
                "freelancerId": req.params.id
            });
            return;
            
        } catch (e) {
            errorHandling(e, res);
        }
    })

    
    /* ........................................ Review dataset collection ................................... */

    // get all reviews for a freelancer by freelancer ID
    app.get('/freelancer/:id/reviews', async (req, res) => {
        try {
            let result = await Reviews.getByFreelancerId(db, req.params.id)
            res.status(200);
            res.send(result)
        } catch (e) {
            errorHandling(e, res);
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

        if (!req.body.reviewerName || req.body.reviewerName.trim().length === 0 || 
            !req.body.rating || req.body.rating.trim().length === 0 || 
            !req.body.recommend || req.body.recommend.trim().length === 0 || 
            !req.body.description || req.body.description.trim().length === 0) {

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
        
        if (isNaN(req.body.rating) || parseInt(req.body.rating) < 1 || parseInt(req.body.rating) > 5) {
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

        if (req.body.email && req.body.email.trim().length > 0) {
            newReviewData.reviewer.email = req.body.email
        }

        let freelancerId = req.params.id;   // retrieve freelancer ID

        try {
            let result = await Reviews.addReview(db, freelancerId, newReviewData);

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
            errorHandling(e, res);
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

            if (!username || username.trim().length === 0 || 
                !password || password.trim().length === 0) {
                res.status(400);
                res.json({
                    "error": "Missing username and/or password"
                });
                return;
            }

            let loginResult = await Logins.verify(db, username, password);
            // check in logins collection DB if the username/password exist using verify function
            if (loginResult !== null) {
                // take that _id in logins collection DB, look into freelancer collection DB to find the freelancer that hold that login _id (under "login" key)
                let authenticatedFreelance = await Freelancers.get(db, 
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
                        "freelancer": authenticatedFreelance[0]
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
            errorHandling(e, res);
        }
    })

    // change password
    app.put('/change-password', async (req, res) => {
        let username = req.body.username;
        let currentPassword = req.body.currentPassword;
        let newPassword = req.body.newPassword;

        if (!username || username.trim().length === 0 ||
            !currentPassword || currentPassword.trim().length === 0 ||
            !newPassword || newPassword.trim().length === 0) {
            res.status(400);
            res.json({
                "error": "Missing username, current password and/or new password"
            });
            return;
        }

        try {
            let result = await Logins.changePassword(db, username, currentPassword, newPassword)
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
            errorHandling(e, res);
        }
    })

    // this matches all routes and all methods  
    // https://levelup.gitconnected.com/how-to-handle-errors-in-an-express-and-node-js-app-cb4fe2907ed9
    app.use((req, res, next) => {
        res.status(404).send({
            status: 404,
            error: "Not found"
        })
    })

}

main();

// start server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server has started on port ${port}`)
});
