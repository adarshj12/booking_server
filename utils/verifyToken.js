const jwt = require('jsonwebtoken');
require('dotenv').config()

const verifyUser =async(req,res,next)=>{
    try {
        // console.log('called');
        const token = req.headers['authorization'].split(' ')[1];
        // console.log(token);
        const decoded=await jwt.verify(token, process.env.SECRET);
        // console.log(decoded);
        if(decoded.user){
            next();
        }    
        else {
            return res.status(401).json({ message: `Unauthorized` });
        } 
    } catch (error) {
        console.log(`error=> ${error.message}`);
        return res.status(403).json({ message: `Authorization failed due to  ${error.message}` })
    }
}

const verifyClient =async(req,res,next)=>{
    try {
        // console.log('called');
        const token = req.headers['authorization'].split(' ')[1];
        // console.log(token);
        const decoded=await jwt.verify(token, process.env.SECRET);
        // console.log(decoded);
        if(decoded.client||decoded.admin){
            next();
        }    
        else {
            return res.status(401).json({ message: `Unauthorized` });
        } 
    } catch (error) {
        console.log(`error=> ${error.message}`);
        return res.status(403).json({ message: `Authorization failed due to  ${error.message}` })
    }
}

const verifyAdmin =async(req,res,next)=>{
    try {
        // console.log('called');
        const token = req.headers['authorization'].split(' ')[1];
        // console.log(token);
        const decoded=await jwt.verify(token, process.env.SECRET);
        // console.log(decoded);
        if(decoded.admin){
            next();
        }    
        else {
            return res.status(401).json({ message: `Unauthorized` });
        } 
    } catch (error) {
        console.log(`error=> ${error.message}`);
        return res.status(403).json({ message: `Authorization failed due to  ${error.message}` })
    }
}


module.exports={
    verifyUser,
    verifyClient,
    verifyAdmin
}