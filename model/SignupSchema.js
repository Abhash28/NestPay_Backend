const mongoose = require("mongoose");

const SignupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/],
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "admin",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("adminSignup", SignupSchema);
