const express=require("express")
const {addProperty, fetchAllProperty,allUnit}=require("../controller/Property")
const {verifyAdmin}=require("../utils/verifyAdmin")

const propertyRouter=express.Router()

propertyRouter.post("/add-property",verifyAdmin,addProperty)
propertyRouter.get("/all-property",verifyAdmin,fetchAllProperty)
propertyRouter.get("/all-units/:propertyId",verifyAdmin,allUnit)

module.exports={propertyRouter};