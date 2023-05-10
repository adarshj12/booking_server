const mongoose = require('mongoose');

const conn = async()=>{
    try {
      await  mongoose.connect('mongodb://127.0.0.1:27017/booking_application',{useUnifiedTopology:true});
      console.log(`database connected`);
    } catch (error) {
        console.log(`error in connection - ${error.message}`);
    }
}

module.exports=conn;