/*
Assigned: Yong En

NOTES:

Needs to handle 3 scenarios, all of which hit the same http webhook handler:

1. fact_checkers signup (rmb to handle duplicates, cos factCheckers can just type that message again)
  a. Get the details needed to populate the user object
  b. Create fact_checker in factCheckers collection

2. Voting on new message (inline keyboard callback button handler for telegram )
  a. Add votes to votes subcollection
  b. Increment vote count

3. Replies to new message with verification link url
  a. Check if its a link to official news agencies (we may have to create a whitelist of cna etc)
  b. If yes
    i. Update verification links subcollection (fact checkers array and count)

RESOURCES:

combine express with functions - https://firebase.google.com/docs/functions/http-events#using_existing_express_apps

*/
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// register new fact checker user
app.post('/register', async (req, res) => {
  const snapshot = await admin.firestore().collection('factCheckers').where("name","==","rrrr").get()
  const hasPrevChecker = snapshot.docs.length 
  if (hasPrevChecker != 0) {
    res.json({ result: `Fact Checker User already exists` });
  } else {
    const newCheckerData = {
      "name": req.body.name,
      "isActive": true,
      "telegramId": 100,
      "level": 0,
      "experience": 0,
      "numVoted":0,
      "numCorrectVotes":0,
      "numVerifiedLinks":0
    }
    const newChecker = await admin.firestore().collection('factCheckers').add(newCheckerData);
  
    res.json({ result: `Fact Checker User with ID: ${newChecker.id} is created.` });
  }

  })

// Expose Express API as a single Cloud Function:
exports.webhookHandlerFactChecker = functions.region('asia-southeast1').https.onRequest(app);