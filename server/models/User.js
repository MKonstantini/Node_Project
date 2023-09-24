const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {type: Object, required: true},
    phone: {type: String, minlength: 10},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    image: {type: Object},
    address: {type: Object},
    isAdmin: {type: Boolean, required: true},
    isBusiness: {type: Boolean, required: true},
    createdAt: {type: String}
})

const User = mongoose.model("users", userSchema)
module.exports = User