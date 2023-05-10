const Room = require('../models/roomModel');
const Hotel = require('../models/hotelModel');
const Client = require('../models/clientModel');
const cloudinary = require('../utils/cloudinary');

const createRoom =async(req,res)=>{
    try {
        const hotelId =req.params.hotelid;
        const arr = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            const data = {
                image_url: result.secure_url,
                image_id: result.public_id
            }
            arr.push(data)
        }
        const newRoom =new Room({
            ...req.body,
            hotel:req.params.hotelid,
            photos: arr
        });
        const savedRoom =await newRoom.save();
        await Hotel.findByIdAndUpdate(hotelId,{$push:{rooms:savedRoom._id}});
        res.status(200).json(savedRoom)
    } catch (error) {
        res.status(500).json({message:`Error -> ${error}`})
    }
}

const updateRoom = async(req,res)=>{
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            {$set:req.body},
            {new:true}
        )
        res.status(200).json(updatedRoom)
    } catch (error) {
        res.status(500).json({message:`Error -> ${error}`})
    }
}

const deleteRoom = async(req,res)=>{
    try {
        await Hotel.findByIdAndUpdate(req.params.hotelid,{
            $pull:{rooms:req.params.id}
        })
        await Room.findByIdAndDelete(req.params.id)
        res.status(200).json('room deleted')
    } catch (error) {
        res.status(500).json({message:`Error -> ${error}`})
    }
}

const getRoom = async(req,res)=>{
    try {
        const room = await Room.findById(req.params.id)
        res.status(200).json(room)
    } catch (error) {
        res.status(500).json({message:`Error -> ${error}`})
    }
}

const getRooms = async(req,res)=>{
    try {
        const rooms = await Room.find(req.params.id)
        res.status(200).json(rooms)
    } catch (error) {
        res.status(500).json({message:`Error -> ${error}`})
    }
}

module.exports={
    createRoom,
    updateRoom,
    getRoom,
    getRooms,
    deleteRoom
}