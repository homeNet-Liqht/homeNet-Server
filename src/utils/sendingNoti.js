const { firebaseAdmin } = require("../config/firebase/admin");

const sendNotification = async (token, { title, body }) => {
  try {
    await firebaseAdmin.messaging().send({
      token: token,
      notification: {
        title: title,
        body: body,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendNotification };
