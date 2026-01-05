const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("db connects");
  } catch (error) {
    throw new Error(`Database connection failed ${error.message}`);
  }
};
module.exports = dbConnect;
