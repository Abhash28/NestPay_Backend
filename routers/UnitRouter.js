const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const { createUnit, updateUnit } = require("../controller/UnitController");
const { verify } = require("jsonwebtoken");

const UnitRouter = express.Router();

// create new unit unit
UnitRouter.post("/create-unit", verifyAdmin, createUnit);
//update old unit
UnitRouter.put("/update-unit", verifyAdmin, updateUnit);

module.exports = { UnitRouter };
