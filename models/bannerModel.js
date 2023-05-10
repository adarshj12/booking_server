const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
    video:{
        type:String,
        required:true
    },
    cloudinary_id:{
        type:String,
        required:true
    }
})

const banner = mongoose.model('banner',BannerSchema);

module.exports=banner;