const mongoose = require("mongoose")

const cardSchema = new mongoose.Schema({
    title: {type: String, required: true},
    subtitle: {type: String, required: true},
    description: {type: String, minlength: 2},
    phone: {type: String, minlength: 10},
    email: {type: String, unique: true},
    website: {type: String, minlength: 2},
    image: {type: Object},
    address: {type: Object},
    bizNumber: {type: String},
    likes: {type: Array},
    createdAt: {type: String},
    createdBy:{type: String, required}
})

const Card = mongoose.model("cards", cardSchema)
module.exports = Card