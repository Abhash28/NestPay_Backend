const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  adminProfile,
  updateAdminProfile,
} = require("../controller/adminProfileController");

const adminProfileRouter = express.Router();

//fetch admin profile data
adminProfileRouter.get("/profile", verifyAdmin, adminProfile);

//update admin profile data
adminProfileRouter.put("/profile-update", verifyAdmin, updateAdminProfile);
module.exports = { adminProfileRouter };
