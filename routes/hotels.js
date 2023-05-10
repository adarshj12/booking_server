const express = require('express');
const { 
    countByCity, 
    countByType, 
    getProperty, 
    getAllHotels, 
    getDestinations, 
    getHotelRooms, 
    getBookingDetails, 
    rateHotel, 
    topDestinations, 
    getRatings, 
    getHotelRating 
} = require('../controllers/hotelController');
const { verifyUser } = require('../utils/verifyToken');
const router = express.Router();

router.get('/getbyCity',countByCity);

router.get('/getbyType',countByType);

router.get('/getProperty/:id',getProperty);

router.get('/getAll',getAllHotels);

router.get('/places',getDestinations);

router.get('/rooms/:id/:start/:end',getHotelRooms);

router.get('/booking/:id',getBookingDetails);

router.post('/rate',verifyUser,rateHotel);

router.get('/top',topDestinations);

router.get('/ratings',getRatings)

router.get('/hotelRating/:id',getHotelRating)



module.exports=router;