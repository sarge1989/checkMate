// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const express = require('express');

// admin.initializeApp();

// const app = express();

// app.get('/', async (req, res) => {
//   const original = req.query.text;
//   const writeResult = await admin.firestore().collection('messages').add({ original: original, instance_count:1 });
//   res.json({ result: `Message with ID: ${writeResult.id} added.` });
// });

// exports.addMessage = functions
//   .region('asia-southeast1')
//   .https.onRequest(app);


const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// register new fact checker user
app.post('/', async (req, res) => {
  const newMessageData = {
    "text":req.body.text,
    "instance_count":2
  }
  const writeResult = await admin.firestore().collection('messages').add(newMessageData);
  res.json({ result: `Message with ID: ${writeResult.id} is added.` });
})

exports.addMessage = functions
  .region('asia-southeast1')
  .https.onRequest(app);
