const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        //required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
})

const users = mongoose.model('users',UserSchema);

module.exports=users;