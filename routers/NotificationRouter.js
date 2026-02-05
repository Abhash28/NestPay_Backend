const express = require("express");
const { saveFcmToken } = require("../controller/NotificationController");
const { verifyAdmin } = require("../utils/verifyAdmin");

const notificationRouter = express.Router();

// Same route for admin & tenant
notificationRouter.post("/save-token", verifyAdmin, saveFcmToken);

module.exports = notificationRouter;
