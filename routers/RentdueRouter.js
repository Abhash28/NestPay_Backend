const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const { getAllRentDue } = require("../controller/RentDue");

const rentDueRouter = express.Router();

rentDueRouter.get("/alldue", verifyAdmin, getAllRentDue);

module.exports = { rentDueRouter };
