const mongoose = require('mongoose');

const conn = async()=>{
    try {
      await  mongoose.connect('mongodb+srv://adarsh:adarsh@cluster0.ryigwjf.mongodb.net/booking_application?retryWrites=true&w=majority',{useUnifiedTopology:true});
      console.log(`database connected`);
    } catch (error) {
        console.log(`error in connection - ${error.message}`);
    }
}

module.exports=conn;