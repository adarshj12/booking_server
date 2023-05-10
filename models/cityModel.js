const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema({
    city:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    },
    cloudinary_id:{
        type:String,
        required:true
    }
})

const cities = mongoose.model('cities',CitySchema);

module.exports=cities;