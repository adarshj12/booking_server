const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    booking_amount: {
        type: Number,
        required: true
    },
    booking_date: {
        type: Date,
        required: true
    },
    client_share: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

// PaymentSchema.pre('save', function (next) {
//     this.client_share = this.booking_amount * 0.8;

//     next();
// });


const payments = mongoose.model('payments', PaymentSchema);

module.exports = payments;