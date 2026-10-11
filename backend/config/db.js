const mongoose = require('mongoose');

async function connectdb() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to mongodb")
    }catch (error){
        console.log("Error is ",error);
    }
}

module.exports = connectdb
