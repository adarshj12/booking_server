const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    booking_date:{
        type: Date,
        required:true
    },
    hotel:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    rate:{
        type: Number,
        required:true
    },
    rooms:{
        type:[mongoose.Schema.Types.ObjectId]
    },
    checkin:{
        type:Date,
        required:true
    },
    checkout:{
        type:Date,
        required:true
    },
    payment_mode:{
        type: String,
        //required:true
    },
    payment_id:{
        type: String,
        //required:true
    },
    status:{
        type:String,
        default:'booked'
    }
})

const booking = mongoose.model('booking',BookingSchema);

module.exports=booking;