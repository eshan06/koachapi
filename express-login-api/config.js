const mongoose = require("mongoose");
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.SERVER, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Could not connect to MongoDB', err);
});

// define schemaf
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// export the User model
module.exports = mongoose.model('User', userSchema);