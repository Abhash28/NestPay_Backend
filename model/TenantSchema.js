const mongoose =require('mongoose')
const TenantSchema=new mongoose.Schema({
   tenantName:{
    type:String,
    required:true
   },
   tenantMobileNo:{
    type:Number,
    required:true
   },
   tenantAddress:{
    type:String,
    required:true
   },
   createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"adminSignup",
    required:true
   }
})
module.exports=mongoose.model("tenant",TenantSchema)