const functions = require("firebase-functions");

const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

var fireStore = admin.firestore()


exports.createUser = functions.firestore
  .document('teams/{teamName}/chats/{chatID}')
  .onCreate((snap, context) => {
    const newValue = snap.data();

    const teamName = context.params.teamName
    const message = newValue.message
    const sender = newValue.sender
    const senderName = newValue.senderName

    functions.logger.info(teamName, { structuredData: true });
    functions.logger.info(message, { structuredData: true });
    functions.logger.info(sender, { structuredData: true });
    const payload = {
      notification: {
        title: senderName + 'さんから新しいメッセージがあります',
        body: message,
      }
    };


    var teamsRef = fireStore.collection('teams');
    teamsRef.doc(teamName).collection('users').get()
      .then(TeamSnapshot => {
        if (TeamSnapshot.empty) {
          functions.logger.info('No such collection!', { structuredData: true });
        } else {
          TeamSnapshot.forEach(doc => {
            var usersRef = fireStore.collection('users');
            usersRef.doc(doc.id).collection('tokens').get()
              .then(UserSnapshot => {
                if (UserSnapshot.empty) {
                  functions.logger.info('No such collection!', { structuredData: true });
                } else {
                  UserSnapshot.forEach(token => {
                    var tokenVal = token.data().token
                    if (doc.id == sender) {
                      return;
                    }
                    functions.logger.info(tokenVal, { structuredData: true });
                    admin.messaging().sendToDevice(tokenVal, payload);
                });
              }
            })
            .catch(err => {
              functions.logger.info('not found', { structuredData: true });
            })
          });
        }
      })
      .catch(err => {
        functions.logger.info('not found', { structuredData: true });
      })
  });