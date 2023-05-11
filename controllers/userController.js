const User = require('../models/usersModel');
const Book = require('../models/bookingModel')
const Room = require('../models/roomModel');
const { instance } = require("../utils/razorpay");
const Hotel = require('../models/hotelModel')
const Payment = require('../models/paymentModel');
const Banner = require('../models/bannerModel');
const City = require('../models/cityModel')
const crypto = require("crypto");
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { emailvalidate } = require('../utils/signupvalidate');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY)

const register = async (req, res) => {
    try {
        let { username, email, password, mobile } = req.body;
        if (!emailvalidate(email)) return res.status(203).json({ message: 'invalid email format' });
        let userExist = await User.findOne({ email }) || await User.findOne({ mobile })
        if (userExist) return res.status(203).json({ message: `user already registered` })
        const salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);
        const newUser = new User({
            username,
            email,
            password,
            mobile
        })
        await newUser.save();
        res.status(201).json({ message: `user registered` })
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(500).json({ message: `user does not exist` });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(500).json({ message: 'invalid email or password' });
        if (user.isBlocked) return res.status(203).json({ blocked: true });
        const token = jwt.sign({ id: user._id, name: user.username, mobile: user.mobile, user: true }, process.env.SECRET);
        res.status(202)
            .json({ message: 'login successful', token })
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const getOTP = async (req, res) => {
    try {
        let user = await User.findOne({ mobile: req.params.id });
        if (user) {
            const token = jwt.sign({ id: user._id, name: user.username, mobile: user.mobile, user: true }, process.env.SECRET);
            return res.status(202).json({ message: 'user exist', token })
        }
        res.status(203).json({ message: "mobile no. mismatch" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const googleAuth = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(name, email, password);
        const userExist = await User.findOne({ email })
        if (!userExist) {
            console.log('new user ');
            const newUser = new User({
                username: name,
                email,
                password
            })
            await newUser.save();
            const token = jwt.sign({ id: newUser._id, name: newUser.username, user: true }, process.env.SECRET);
            return res.status(202).json({ message: 'login successful', token })
        } else {
            if (userExist.isBlocked) return res.status(203).json({ blocked: true });
            const token = jwt.sign({ id: userExist._id, name: userExist.username, mobile: userExist.mobile, user: true }, process.env.SECRET);
            return res.status(202).json({ message: 'login successful', token })
        }
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const mobileUpdate = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                mobile: req.body.mobile
            }
        }, { new: true })
        res.status(200).json({ message: 'mobile updated', user })
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const getUserDetail = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json('user not found');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` })
    }
}

const deleteuser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("user deleted");
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        await User.findByIdAndUpdate(req.params.id, req.body)
        res.status(200).json('user updated');
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}


const createBooking = async (hotelId, roomTitle, dateRange, count, user, payment, rate) => {
    try {
        console.log(hotelId, roomTitle, dateRange, count, user, payment, rate);

        let dateStrings = dateRange.map((str) => new Date(str).toDateString());
        const book = new Book({
            user,
            booking_date: new Date(),
            hotel: hotelId,
            rate,
            checkin: dateRange[0],
            checkout: dateRange[dateRange.length - 1]
        });
        const savedBook = await book.save();
        const rooms = await Room.find({ title: roomTitle, hotel: hotelId });
        // console.log(rooms);
        for (let i = 0; i < rooms.length && count > 0; i++) {
            const room = rooms[i];
            let dates = room.unavailableDates.map((date) => new Date(date).toDateString());
            if (dates.some((date) => dateStrings.includes(date))) {
                console.log('Room already booked for some dates');
                continue;
            }
            await Room.findByIdAndUpdate(room._id, {
                $push: {
                    unavailableDates: dateRange
                }
            }, { new: true });
            await Book.findByIdAndUpdate(savedBook._id, {
                $push: {
                    rooms: room._id
                }
            });
            if (payment.razorpay) {
                await Book.findByIdAndUpdate(savedBook._id, {
                    $set: {
                        payment_mode: 'razorpay',
                        payment_id: payment.id
                    }
                });
            } else if (payment.stripe) {
                await Book.findByIdAndUpdate(savedBook._id, {
                    $set: {
                        payment_mode: 'stripe',
                        payment_id: payment.id
                    }
                });
            }
            count--;
        }
        const hotelDetails = await Hotel.findById(hotelId)
        const pay = new Payment({
            booking: savedBook._id,
            status: 'pending',
            client: hotelDetails.client,
            booking_amount: rate,
            booking_date: savedBook.booking_date,
            client_share: rate * 0.8
        })
        const paymentDetails = await pay.save();
        console.log('booking successful');
    } catch (error) {
        console.log(error);
        // throw new Error(`Error -> ${error.message}`);
    }
};



const BOOKING_DETAILS = {}
let stripe_username =''
const bookingDetails = async(req, res) => {
    try {
        BOOKING_DETAILS.user = req.body.userId;
        BOOKING_DETAILS.dateRange = req.body.dateRange;
        BOOKING_DETAILS.hotelid = req.body.hotelid;
        BOOKING_DETAILS.room = req.body.room;
        BOOKING_DETAILS.count = req.body.count;
        BOOKING_DETAILS.rate = req.body.rate
        const user=await User.findById(req.body.userId)
        stripe_username=user.username
        console.log(BOOKING_DETAILS);
        res.status(201).json({ success: true })
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
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
        await createBooking(BOOKING_DETAILS.hotelid, BOOKING_DETAILS.room, BOOKING_DETAILS.dateRange, BOOKING_DETAILS.count, BOOKING_DETAILS.user, { razorpay: true, id: razorpay_payment_id }, BOOKING_DETAILS.rate);
        res.redirect(`https://www.booknstay.site/paymentsuccess?reference=${razorpay_payment_id}`)
    } else {
        res.status(400).json({ success: false })
    }
};



const stripe_payment = async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: req.body.data.item,
                    },
                    unit_amount: req.body.data.total * 100,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',

        success_url: `https://www.booknstay.site/paymentsuccess`,
        cancel_url: 'https://www.booknstay.site/paymentcancel',
    });
    res.json({ url: session.url });
}

let endpointSecret;

const stripe_webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let eventType;
    let data;

    if (endpointSecret) {
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        data = event.data.object;
        eventType = event.type;
    } else {
        data = req.body.data.object;
        eventType = req.body.type;
    }


    if (eventType === 'checkout.session.completed') {
        const paymentId = data.payment_intent;
        const payment = await stripe.paymentIntents.retrieve(paymentId);
        await createBooking(BOOKING_DETAILS.hotelid, BOOKING_DETAILS.room, BOOKING_DETAILS.dateRange, BOOKING_DETAILS.count, BOOKING_DETAILS.user, { stripe: true, id: payment.id }, BOOKING_DETAILS.rate);
    }
    res.send();
}

const getMyBookings = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const size = req.query.size ? parseInt(req.query.size) : 10;
        const skip = (page - 1) * size;
        const data = await Book.aggregate([
            {
                '$match': {
                    'user': new mongoose.Types.ObjectId(req.query.id)
                }
            }, {
                '$lookup': {
                    'from': 'hotels',
                    'localField': 'hotel',
                    'foreignField': '_id',
                    'as': 'hotel'
                }
            }, {
                '$unwind': {
                    'path': '$hotel'
                }
            }
        ])
        const total = data.length;
        const list = data.slice(skip, skip + size);
        return res.json({
            records: list,
            total,
            page,
            size
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const getMyBookng = async (req, res) => {
    try {
        const data = await Book.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$lookup': {
                    'from': 'hotels',
                    'localField': 'hotel',
                    'foreignField': '_id',
                    'as': 'hotel'
                }
            }, {
                '$unwind': {
                    'path': '$hotel'
                }
            }, {
                '$lookup': {
                    'from': 'rooms',
                    'localField': 'rooms',
                    'foreignField': '_id',
                    'as': 'rooms'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, {
                '$project': {
                    '_id': 1,
                    'user.username': 1,
                    'user._id':1,
                    'user.email': 1,
                    'user.mobile': 1,
                    'booking_date': 1,
                    'status': 1,
                    'hotel._id': 1,
                    'hotel.name': 1,
                    'hotel.client': 1,
                    'hotel.type': 1,
                    'hotel.city': 1,
                    'hotel.address': 1,
                    'hotel.distance': 1,
                    'hotel.title': 1,
                    'hotel.photos.image_url': {
                        '$arrayElemAt': [
                            '$hotel.photos.image_url', 0
                        ]
                    },
                    'rooms':1,
                    'rate':1,
                    'checkin': 1,
                    'checkout': 1,
                    'payment_id': 1,
                    'payment_mode': 1
                }
            }
        ])
        if (!data) return res.status(403).json('data not found')
        res.status(200).json(data[0])
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const banner = async(req,res)=>{
    try {
        const banner = await Banner.findOne()
        res.status(200).json(banner)
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

const cities = async(req,res)=>{
    try {
        const cities = await City.find();
        if(!cities) return res.status(203).json('no cities found');
        res.status(200).json(cities)
    } catch (error) {
        res.status(500).json({ message: `Error -> ${error.message}` });
    }
}

module.exports = {
    register,
    login,
    getOTP,
    getUserDetail,
    deleteuser,
    updateUser,
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
}