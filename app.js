const express = require('express');
const cors = require('cors');
const app = express();
const userRoute = require('./routes/users');
const adminRoute = require('./routes/admin');
const clientRoute = require('./routes/client');
const hotelRoute = require('./routes/hotels');
const roomRoute = require('./routes/rooms');
const chatRoute = require('./routes/chat');
const connection = require('./config/db');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

//middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/users', userRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/client', clientRoute);
app.use('/api/v1/hotels', hotelRoute);
app.use('/api/v1/rooms', roomRoute);
app.use('/api/v1/chat', chatRoute);

app.get('/api/v1/getKey', (req, res) => res.status(200).json({ key: process.env.RAZORPAY_API_KEY }))


try {

    let users = []

    const addUser = (userId, socketId) => {
        !users.some(user => user.userId === userId) &&
            users.push({ userId, socketId })
    }

    const removeUser = (socketId) => {
        users = users.filter(user => user.socketId !== socketId)
    }

    const getUser = (userId) => {
        return users.find(user => user.userId === userId)
    }

    io.on("connection", (socket) => {
        socket.on("addUser", userId => {
            addUser(userId, socket.id)
            io.emit("getUsers", users)
        })
        socket.on('sendMessage', ({ senderId, receiverId, text }) => {
            const user = getUser(receiverId)
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text
            })
        })
        socket.on("disconnect", () => {
            removeUser(socket.id)
            io.emit("getUsers", users)
        })
    })
} catch (error) {
    console.log(error.message);

}
const port = process.env.PORT

server.listen(port, async () => {
    await connection();
    console.log(`server started at http://localhost:${port}`);
})