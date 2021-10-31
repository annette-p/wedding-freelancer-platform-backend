/**
 * @swagger
 * components:
 *   schemas:
 *     Freelancer:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - specialized
 *         - rate
 *         - rateUnit
 *         - bio
 *         - showCase
 *         - profileImage
 *       properties:
 *         _id:
 *           type: object
 *           description: The auto-generated id of the Freelancer
 *         name:
 *           type: string
 *           description: The name of the Freelancer
 *         bio:
 *           type: string
 *           description: Description about the past experience and overall profile of the Freelancer
 *         contact:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: Email address of freelancer
 *             mobile:
 *               type: string
 *               description: Mobile number of freelancer
 *             website:
 *               type: string
 *               description: Website address of freelancer
 *         socialMedia:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *               description: Facebook url of freelancer
 *             instagram:
 *               type: string
 *               description: Instagram url of freelancer
 *             tiktok:
 *               type: string
 *               description: Tiktok url of freelancer
 *         type:
 *           type: string
 *           description: The profession of the Freelancer
 *           enum: ["makeup-artist", "photographer", "videographer"]
 *         specialized:
 *           type: array
 *           items:
 *             type: string
 *           description: The specializations of the Freelancer
 *         rate:
 *           type: integer
 *           description: The rate of the service for the Freelancer, either hourly or per session
 *         rateUnit:
 *           type: string
 *           description: The unit of the rate of the service for the Freelancer
 *           oneOf:
 *             - hour
 *             - session
 *         profileImage:
 *           type: string
 *           description: The website address of the Freelancer's profile image
 *         showCase:
 *           type: string
 *           description: The website address of the image or video of the Freelancer's showcase
 *         portfolios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the portfolio
 *               description:
 *                 type: string
 *                 description: The description of the portfolio
 *               url:
 *                 type: string
 *                 description: The website address of the portfolio
 *           minItems: 1
 *           maxItems: 3
 *         login:
 *           type: object
 *           description: The auto-generated id of the document in Login collection for the Freelancer
 *         date:
 *           type: date-time
 *           description: The date/time that the freelance profile was created. This is system-generated.
 * 
 *     Freelancers:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           schema:
 *             $ref: '#components/schemas/Freelancer'
 * 
 *     Review:
 *       type: object
 *       required:
 *         - description
 *         - rating
 *       properties:
 *         _id:
 *           type: object
 *           description: The auto-generated id of the Review
 *         reviewer:
 *           type: object
 *           description: The person providing the review
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the reviewer
 *             email:
 *               type: string
 *               description: Email address of the reviewer
 *             tag:
 *               type: string
 *               description: Tagging to categorize the reviews
 *         description:
 *           type: string
 *           description: The content of the review
 *         rating:
 *           type: integer
 *           description: The rating level
 *           minimum: 1
 *           maximum: 5
 *         recommend:
 *           type: boolean
 *           description: Will the reviewer recommend the freelancer to others?
 *         for:
 *           type: string
 *           description: The auto-generated id of the Freelancer the review is intended for
 *         date:
 *           type: date-time
 *           decription: The date/time that the review was given. This is system-generated.
 * 
 *     Reviews:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           schema:
 *             $ref: '#components/schemas/Review'
 * 
 *     Login:
 *       type: object
 *       properties:
 *         _id:
 *           type: object
 *           description: The auto-generated id of the Login
 *         username:
 *           type: string
 *           description: The username of the freelancer
 *         password:
 *           type: string
 *           description: The encrypted password of the freelancer
 * 
 *     Logins:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           schema:
 *             $ref: '#components/schemas/Login'
 * 
 *     Survey:
 *       type: object
 *       properties:
 *         _id:
 *           type: object
 *           description: The auto-generated id of the Survey
 *         category:
 *           type: string
 *           description: The category for the survey data
 *         response:
 *           type: object
 *           properties:
 *             reasonToLeave:
 *               type: string
 *             additionalInfo:
 *               type: string
 * 
 *     Surveys:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           schema:
 *             $ref: '#components/schemas/Survey'
 * 
 *   requestBodies:
 *     Freelancer:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - specialized
 *         - rate
 *         - rateUnit
 *         - bio
 *         - showCase
 *         - profileImage
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the Freelancer
 *         bio:
 *           type: string
 *           description: Description about the past experience and overall profile of the Freelancer
*         contact:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: Email address of freelancer
 *             mobile:
 *               type: string
 *               description: Mobile number of freelancer
 *             website:
 *               type: string
 *               description: Website address of freelancer
 *         socialMedia:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *               description: Facebook url of freelancer
 *             instagram:
 *               type: string
 *               description: Instagram url of freelancer
 *             tiktok:
 *               type: string
 *               description: Tiktok url of freelancer
 *         type:
 *           type: string
 *           description: The profession of the Freelancer
 *           enum: ["makeup-artist", "photographer", "videographer"]
 *         specialized:
 *           type: array
 *           items:
 *             type: string
 *           description: The specializations of the Freelancer
 *         rate:
 *           type: integer
 *           description: The rate of the service for the Freelancer, either hourly or per session
 *         rateUnit:
 *           type: string
 *           description: The unit of the rate of the service for the Freelancer
 *           oneOf:
 *             - hour
 *             - session
 *         profileImage:
 *           type: string
 *           description: The website address of the Freelancer's profile image
 *         showCase:
 *           type: string
 *           description: The website address of the image or video of the Freelancer's showcase
 *         portfolios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the portfolio
 *               description:
 *                 type: string
 *                 description: The description of the portfolio
 *               url:
 *                 type: string
 *                 description: The website address of the portfolio
 *           minItems: 1
 *           maxItems: 3
 * 
 *     NewFreelancerLogin:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The preferred username for the Freelancer
 *         password:
 *           type: string
 *           description: The preferred password for the Freelancer
 * 
 *     NewFreelancer:
 *       type: object
 *       properties:
 *         schema:
 *           allOf:
 *             - $ref: '#/components/requestBodies/NewFreelancerLogin'
 *             - $ref: '#/components/requestBodies/Freelancer'
 * 
 *     EditFreelancer:
 *       type: object
 *       properties:
 *         schema:
 *           allOf:
 *             - $ref: '#/components/requestBodies/Freelancer'
 * 
 *     DeleteFreelancer:
 *       type: object
 *       properties:
 *         reasonToLeave:
 *           type: string
 *           description: The reason for deleting the account
 *         additionalInfo:
 *           type: string
 *           description: The user-defined reason for deleting the account
 *         password:
 *           type: string
 *           description: The current password of the Freelancer
 * 
 *     Review:
 *       type: object
 *       required:
 *         - reviewerName
 *         - rating
 *         - recommend
 *         - description
 *       properties:
 *         reviewerName:
 *           type: string
 *           description: The name of the reviewer
 *         email:
 *           type: string
 *           description: The email address of the reviewer
 *         rating:
 *           type: integer
 *           description: The rating level
 *           minimum: 1
 *           maximum: 5
 *         recommend:
 *           type: boolean
 *           description: Will the reviewer recommend the freelancer to others?
 * 
 *     NewReview:
 *       type: object
 *       properties:
 *         schema:
 *           allOf:
 *             - $ref: '#/components/requestBodies/Review'
 * 
 *     Login:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the freelancer
 *         password:
 *           type: string
 *           description: The password of the freelancer
 * 
 *     ChangePassword:
 *       type: object
 *       required:
 *         - username
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the freelancer
 *         currentPassword:
 *           type: string
 *           description: The current password of the freelancer
 *         newPassword:
 *           type: string
 *           description: The new preferred password of the freelancer
 */