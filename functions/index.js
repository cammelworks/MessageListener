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

    functions.logger.info(teamName, { structuredData: true });
    functions.logger.info(message, { structuredData: true });
    functions.logger.info(sender, { structuredData: true });


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
                  UserSnapshot.forEach(doc => {
                    if (doc.id == sender) {
                      return;
                    }
                    functions.logger.info(doc.id, { structuredData: true });
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
