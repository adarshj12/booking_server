const express = require('express');
const { 
    register, 
    login, 
    checkVerification, 
    getClientBookings, 
    getBookingsPagination, 
    getData, 
    changeBookingStatus, 
    cancelledBookings, 
    getClientDetail 
} = require('../controllers/clientController');
const { verifyClient } = require('../utils/verifyToken');
const { 
    createHotel, 
    getClientProperties, 
    deleteProperty, 
    updateProperty, 
    userBookingDetail 
} = require('../controllers/hotelController');
const multer = require('../utils/multer');
const router = express.Router();


router.post('/register',register);

router.post('/login',login);

router.get('/detail/:id',verifyClient,getClientDetail)

router.get('/checkStatus/:id',verifyClient,checkVerification);

router.post('/createHotel/:id',verifyClient,multer.array('image'),createHotel);

router.get('/getProperties/:id',verifyClient,getClientProperties);

router.delete('/deleteproperty/:id',verifyClient,deleteProperty);

router.put('/update/:id',verifyClient,multer.array('image'),updateProperty)

router.get('/getBookings/:id',verifyClient,getClientBookings)

router.get('/getmybookings/:id/:page/:size',verifyClient,getBookingsPagination)

router.get('/getUserBookingDetail/:id',verifyClient,userBookingDetail);

router.get('/earnings/:id',verifyClient,getData);

router.get('/bookingstatus/:id',verifyClient,changeBookingStatus)

router.get('/cancellations',verifyClient,cancelledBookings)

module.exports=router;