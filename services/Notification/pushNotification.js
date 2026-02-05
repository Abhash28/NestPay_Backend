const admin = require("../../config/firebaseAdmin");

const pushNotification = async (tokens, title, body) => {
  if (!tokens || tokens.length === 0) return;

  const message = {
    tokens,
    notification: {
      title,
      body,
    },
  };

  await admin.messaging().sendEachForMulticast(message);
};

module.exports = { pushNotification };
