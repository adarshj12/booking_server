const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
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
        type:Number,
        required:true
    },
    earnings:{
        type:Number,
        default:0
    },
    verified:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
})

const clients = mongoose.model('clients',ClientSchema);

module.exports=clients;