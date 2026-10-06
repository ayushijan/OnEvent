const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true
    },
    phone:String,
    password:String,
    profileImage:String,
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    status:{
        type:String,
        enum:["active","blocked"],
        default:"active"
    },
    isVerified:{
        type:Boolean,
        default: false
    },
    authProvider:{
        type:String,
        enum:["local","google"],
        default:"local"
    }
},
{
    timestamps:true
});

const User=mongoose.model("User",userSchema);
module.exports=User;