const jwt = require('jsonwebtoken');
require('dotenv').config();
const admin_username = process.env.ADMIN_USERNAME
const admin_password = process.env.ADMIN_PASSWORD
const User = require('../models/usersModel');
const Client = require('../models/clientModel');
const Hotel = require('../models/hotelModel');
const Payment = require('../models/paymentModel');
const Book = require('../models/bookingModel');
const Banner = require('../models/bannerModel');
const { instance } = require("../utils/razorpay");
const crypto = require("crypto");
const City = require('../models/cityModel')
const cloudinary = require('../utils/cloudinary');
const multer = require('../utils/multer');
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if ((email !== admin_username) || (password !== admin_password)) return res.status(203).json({ message: `email error` });
        const token = jwt.sign({ name: "admin", admin: true }, process.env.SECRET);
        res.status(202).json({ message: 'login successful', token })
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const size = req.query.size ? parseInt(req.query.size) : 10;
        const skip = (page - 1) * size;
        const users = await User.find();
        // if (users.length > 0) {
        //     return res.status(201).json({ message: 'users found', users });
        // } else {
        //     return res.status(404).json({ message: 'users not found' });
        // }
        const total = users.length;
        const list = users.slice(skip, skip + size);
        //console.log(list);
        return res.json({
            records: list,
            total,
            page,
            size
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Error -> ${error.message}` });
    }
}


const getAllClients = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const size = req.query.size ? parseInt(req.query.size) : 10;
        const skip = (page - 1) * size;
        const clients = await Client.find();
        // console.log(clients);
        // if (clients.length > 0) return res.status(201).json({ message: 'clients found', clients })
        // res.status(404).json({ message: 'clients not found' })
        const total = clients.length;
        const list = clients.slice(skip, skip + size);
        //console.log(list);
        return res.json({
            records: list,
            total,
            page,
            size
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const blockClient = async (req, res) => {
    try {
        await Client.findOneAndUpdate({ _id: req.params.id }, [{ $set: { isBlocked: { $eq: [false, "$isBlocked"] } } }]);
        res.status(200).json("status updated")
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const verifyClient = async (req, res) => {
    try {
        await Client.findOneAndUpdate({ _id: req.params.id }, [{ $set: { verified: { $eq: [false, "$verified"] } } }]);
        res.status(200).json("status updated")
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const blockUsers = async (req, res) => {
    try {
        await User.findOneAndUpdate({ _id: req.params.id }, [{ $set: { isBlocked: { $eq: [false, "$isBlocked"] } } }]);
        res.status(200).json("status updated")
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const getAllProperties = async (req, res) => {
    try {
        const page = req.query.page ? Math.ceil(req.query.page) : 1;
        const size = req.query.size ? Math.ceil(req.query.size) : 10;
        const skip = (page - 1) * size;
        const hotels = await Hotel.aggregate([
            {
                '$lookup': {
                    'from': 'clients',
                    'localField': 'client',
                    'foreignField': '_id',
                    'as': 'result'
                }
            }, {
                '$unwind': {
                    'path': '$result'
                }
            }, {
                '$project': {
                    '_id': 1,
                    'name': 1,
                    'type': 1,
                    'city': 1,
                    'photos': 1,
                    'result.username': 1
                }
            }
        ])
        // res.status(200).json(hotels)
        const total = hotels.length;
        const list = hotels.slice(skip, skip + size);
        //console.log(list);
        return res.json({
            records: list,
            total,
            page,
            size
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const payments = async (req, res) => {
    try {
        const page = req.params.page ? parseInt(req.params.page) : 1;
        const size = req.params.size ? parseInt(req.params.size) : 10;
        const skip = (page - 1) * size;
        const data = await Payment.aggregate([
            {
                '$lookup': {
                    'from': 'clients',
                    'localField': 'client',
                    'foreignField': '_id',
                    'as': 'client'
                }
            }, {
                '$unwind': {
                    'path': '$client'
                }
            }, {
                '$lookup': {
                    'from': 'bookings',
                    'localField': 'booking',
                    'foreignField': '_id',
                    'as': 'booking'
                }
            }, {
                '$unwind': {
                    'path': '$booking'
                }
            }
        ])
        const total = data.length;
        const list = data.slice(skip, skip + size);
        res.json({
            records: list,
            total,
            page,
            size
        })
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}



const dashboard = async (req, res) => {
    try {
        const users = await User.countDocuments()
        const properties = await Hotel.countDocuments()
        const total = await Book.aggregate([
            {
                $group: {
                    _id: null,
                    totalRate: { $sum: "$rate" }
                }
            }
        ])
        const payment = await Book.aggregate([
            {
                '$group': {
                    '_id': '$payment_mode',
                    'count': {
                        '$sum': 1
                    }
                }
            }
        ])
        const revenue = await Book.aggregate([
            {
                '$group': {
                    '_id': {
                        '$month': '$booking_date'
                    },
                    'revenue': {
                        '$sum': '$rate'
                    }
                }
            },
            {
                '$project': {
                    'month': '$_id',
                    'revenue': 1,
                    '_id': 0
                }
            },
            {
                '$sort': {
                    'month': 1
                }
            }
        ])
        res.status(200).json({ payment, revenue, users, properties, total })
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const addBanner = async (req, res) => {
    try {
        console.log(req.file);
        const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'video' });
        let banner = new Banner({
            video: result.secure_url,
            cloudinary_id: result.public_id,
        });
        await banner.save();
        res.status(201).json(`banner added with url ${result.secure_url}`);
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const updateBanner = async (req, res) => {
    try {
        let banner = await Banner.findById(req.params.id);
        await cloudinary.uploader.destroy(banner.cloudinary_id, { resource_type: 'video' });
        const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'video' });
        const data = {
            video: result.secure_url || banner.video,
            cloudinary_id: result.public_id || banner.cloudinary_id
        }
        banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true })
        res.status(201).json(`banner updaated with url ${result.secure_url}`)
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const addCityImage = async (req, res) => {
    try {
        const data = await City.findOne({ city: req.body.city })
        if (data) return res.status(403).json('city already exist')
        const result = await cloudinary.uploader.upload(req.file.path);
        let citymage = new City({
            city: req.body.city,
            photo: result.secure_url,
            cloudinary_id: result.public_id
        });
        await citymage.save();
        res.status(201).json(`city image added ${result.secure_url}`)
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const PAYMENT_DATA = {}

const paytoClientDetails = async (req, res) => {
    try {
        PAYMENT_DATA.id = req.body.id;
        PAYMENT_DATA.share = req.body.share;
        PAYMENT_DATA.payid = req.body.payid;
        res.status(200).json({ success: true })
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const payclient = async (id, share, payid) => {
    try {
        const amount = share
        const client = await Client.findById(id)
        await Client.findByIdAndUpdate(id, {
            $set: {
                earnings: client.earnings + amount
            }
        })
        await Payment.findByIdAndUpdate(payid, {
            $set: {
                status: 'paid'
            }
        })
        console.log('payment successful');
    } catch (error) {
        console.log(error);
        // throw new Error(`Error -> ${error.message}`);
    }
}

const checkout = async (req, res) => {
    var options = {
        amount: Number(req.body.amount * 100),
        currency: "INR"
    };
    const order = await instance.orders.create(options)
    res.status(200).json({ success: true, order })
}

const verification = async (req, res) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET)
        .update(body.toString())
        .digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        await payclient(PAYMENT_DATA.id, PAYMENT_DATA.share, PAYMENT_DATA.payid);
        res.redirect(`http://localhost:3000/admin/paymentsuccess?reference=${razorpay_payment_id}`)
    } else {
        res.status(400).json({ success: false })
    }
};

module.exports = {
    login,
    getAllUsers,
    getAllClients,
    blockClient,
    verifyClient,
    blockUsers,
    getAllProperties,
    payments,
    payclient,
    dashboard,
    addBanner,
    updateBanner,
    addCityImage,
    paytoClientDetails,
    checkout,
    verification
}