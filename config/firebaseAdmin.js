const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT),
});

module.exports = admin;
