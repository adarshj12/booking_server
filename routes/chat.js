const express = require('express');
const { 
    openConversation, 
    getConversations, 
    newMessage, 
    getMessages 
} = require('../controllers/chatController');
const router = express.Router();

router.post('/startconverse',openConversation)

router.get('/conversations/:userId',getConversations)

router.post('/message',newMessage);

router.get('/messages/:conversationId',getMessages)

module.exports=router;