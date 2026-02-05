const admin = require("../../config/firebaseAdmin");

const pushNotification = async (tokens, title, body, url) => {
  if (!tokens || tokens.length === 0) return;

  const message = {
    tokens,
    data: {
      title,
      body,
      url,
    },
  };

  await admin.messaging().sendEachForMulticast(message);
};

module.exports = { pushNotification };
