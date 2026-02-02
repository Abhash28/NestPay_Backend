const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin.js");
const { testWhatsapp } = require("../controller/whatsappController");

const whatsappRouter = express.Router();

// Route definition
whatsappRouter.get("/test-whatsapp", testWhatsapp);

module.exports = whatsappRouter;
