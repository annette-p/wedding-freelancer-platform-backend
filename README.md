# Wedding Freelancer Platform API

## Local Development Environment Setup

### Pre-requisites

* Sign-up for a free MongoDB account at https://www.mongodb.com/atlas
* Create a `.env` file in the same directory as `index.js` with the below-contents.

Refer to this [page](https://docs.mongodb.com/guides/cloud/connectionstring/) for details on how to obtain the MongoDB connection details.

```
MONGO_URL=<MongoDB-Connection-Details>
MONGO_DBNAME=weddingFreelancersDB
PORT=3100
```

### Setting up

* Install the required NodeJS packages

```
npm install
```

* Start the application

```
npm start
```