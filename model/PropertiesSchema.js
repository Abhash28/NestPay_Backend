const mongoose =require ("mongoose");
const ProeprtiesSchema=new mongoose.Schema({
    propertyName:{
        type:String,
        required:true,
    },
    propertyAddress:{
        type:String,
        required:true,
    },
    totalUnits:{
        type:Number,
        required:true,
        min:1,
    },
    monthlyRent:{
        type:Number,
        required:true
    },
    //admin schema ref
    createdBy:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"adminSignup",
        required:true
    }
   },
    {
        timestamps:true
    }
)
module.exports=mongoose.model("Properties",ProeprtiesSchema)