const express = require('express');
const router = express.Router();
const multer = require('../utils/multer');
const { verifyClient } = require('../utils/verifyToken');
const { 
    createRoom, 
    updateRoom, 
    deleteRoom, 
    getRoom, 
    getRooms 
} = require('../controllers/roomController');


router.post('/addroom/:hotelid',verifyClient,multer.array('image'),createRoom);

router.put('/:id',verifyClient,updateRoom);

router.delete('/:id/:hotelid',verifyClient,deleteRoom);

router.get('/:id',verifyClient,getRoom);

router.get('/',verifyClient,getRooms);



module.exports=router;