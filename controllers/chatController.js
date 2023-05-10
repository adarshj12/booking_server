const Conversation = require('../models/conversationsModel');
const Message = require('../models/messagesModel');
const User= require('../models/usersModel');
const Client = require('../models/clientModel')

const openConversation = async (req, res) => {
    try {
        const user1 = await User.findById(req.body.senderId)
        const user2 = await Client.findById(req.body.receiverId)
        if(!user1||!user2) return res.status(404).json('user does not exist')
        // const conversation = await Conversation.find({
        //     members: { $in: [req.body.senderId,req.body.receiverId] }
        // })
        // if(conversation) return res.status(403).json('conversation already established')
        const newConversation = new Conversation({
            members: [req.body.senderId, req.body.receiverId]
        })
        const savedConversation = await newConversation.save()
        res.status(201).json(savedConversation)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

const getConversations = async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $in: [req.params.userId] }
        })
        res.status(200).json(conversation)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

const newMessage = async (req, res) => {
    try {
        const newMessage = new Message(req.body)
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

module.exports={
    openConversation,
    getConversations,
    newMessage,
    getMessages
}