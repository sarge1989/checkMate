/*
Assigned: Yong En

NOTES:

On update to any messages instance count:

1. if instance count above thresholdToStartVote in system_parameters collection
    1. Loop through fact checkers in the factCheckers collection
        1. if factCheckers are active
            1. send them telegram message with inline keyboard with callback buttons for voting

*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.launchVote = functions.firestore.document('/messages/{documentId}')
  .onWrite(async (snap, context) => {

    const snapshot = await admin
      .firestore()
      .collection('systemParameters')
      .doc('AuqutCm6KcMTJf5VjT9m')
      .get()

    var startThreshold = snapshot.data().thresholdToStartVote
    var endThreshold =  snapshot.data().thresholdToEndVote

    if (startThreshold || endThreshold == -1) {
      functions.logger.log('No start and end threshold set')
    }

    const original = snap.after.data()

    var activeCheckers = []
    if (original.instance_count >= startThreshold & original.instance_count < endThreshold) {
       const factCheckers = await admin.firestore().collection('factCheckers').get();
       factCheckers.forEach((doc) => {
        if (doc.data().isActive==true) {
          activeCheckers.push(doc.data().name)
        }})
       console.log(activeCheckers)
    }

});

