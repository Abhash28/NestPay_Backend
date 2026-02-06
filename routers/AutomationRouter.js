const express = require("express");
const automationRouter = express.Router();

const automationAuth = require("../utils/automationAuth");
const {
  runGenerateRent,
  runOverdueUpdate,
  runRentDueNotify,
} = require("../controller/AutomationController");

automationRouter.post("/generate-rent", automationAuth, runGenerateRent);
automationRouter.post("/update-overdue", automationAuth, runOverdueUpdate);
automationRouter.post("/send-rent-due", automationAuth, runRentDueNotify);

module.exports = automationRouter;
