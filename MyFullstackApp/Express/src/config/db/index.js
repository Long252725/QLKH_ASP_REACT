const mongoose = require('mongoose');
require('dotenv').config()

async function connect() {
 try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("SUCCESS")
 } catch (error) {
    console.log("ERROR")
 }
}

module.exports = {connect}