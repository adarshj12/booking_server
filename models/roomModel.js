const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    image_url: {
        type: String,
        required: true
    },
    image_id: {
        type: String,
        required: true
    }
});


const RoomSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    hotel:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    rate:{
        type:Number,
        required:true
    },
    people:{
        type:Number,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    unavailableDates:{
            type:[Date]
    },
    photos:{
        type:[ImageSchema]
    },
    // rooms:{
    //     type:Number,
    //     required:true
    // }
   
})

//[{number:101,unavailableDates:[01.05.2022,02.05.2022]}]
//[{number:102,unavailableDates:[04.05.2022,06.05.2022]}]

const rooms = mongoose.model('rooms',RoomSchema);

module.exports=rooms;