const express = require('express');
const { 
    register, 
    login, 
    getOTP, 
    updateUser, 
    getUserDetail,
    checkout, 
    verification, 
    stripe_payment, 
    stripe_webhook, 
    bookingDetails, 
    getMyBookings, 
    googleAuth, 
    mobileUpdate, 
    getMyBookng, 
    banner,
    cities
} = require('../controllers/userController');
const { verifyUser } = require('../utils/verifyToken');
const { cancelBooking } = require('../controllers/hotelController');
const router = express.Router();

router.get('/',(req,res)=>{
    res.json({message:'user'})
})

router.post('/register',register);

router.post('/login',login);

router.get('/otp/:id',getOTP);

router.get('/getuser/:id',verifyUser,getUserDetail);

router.put('/updateuser/:id',verifyUser,updateUser);

router.post('/booking',bookingDetails);

router.post('/checkout',checkout);

router.post('/verification',verification)

router.post('/create-checkout-session',stripe_payment)

router.post('/webhook', express.raw({type: 'application/json'}),stripe_webhook)

router.get('/bookings',verifyUser,getMyBookings)

router.get('/booking/:id',verifyUser,getMyBookng)

router.post('/googleAuth',googleAuth)

router.put('/mobileupdate/:id',verifyUser,mobileUpdate);

router.get('/cancel/:id',verifyUser,cancelBooking);

router.get('/banner',banner);

router.get('/cities',cities)


module.exports=router;