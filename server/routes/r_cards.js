const express = require("express")
const router = express.Router()
const _ = require("lodash")

const Card = require("../models/Card")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const auth = require("../middleware/auth")

// Joi object
const joi = require("joi")
const User = require("../models/User")
const cardJoiSchema = joi.object({
    title: joi.string().required(),
    subtitle: joi.string().required(),
    description: joi.string(),
    phone: joi.string().min(9),
    email: joi.string(),
    web: joi.string(),
    image: joi.object(),
    address: joi.object(),
    bizNumber: joi.string(),
    likes: joi.array(),
})

// POST NEW CARD
router.post("/", async (req, res) => {
    try {
        // handle unauthorization
        if (req.payload.isBusiness != true)
        return res.status(401).send("unauthorized")

        // joi validation
        const {error} = cardJoiSchema.validate(req.body)
        if (error) return res.status(400).send(error) 
        
        // create and post card
        let card = new Card(req.body)

        // add createdAt and createdBy field
        const dateStr = new Date().toString()
        card.createdAt = dateStr
        card.createdBy = req.payload.email

        // save card
        await card.save()

        // return card as res
        res.status(200).send(card)
        
    } catch (err) {
        res.status(400).send(err)
    }
})

// GET ALL CARDS
router.get("/", async(req, res) => {
    try {
        // get all cards from DB
        const cards = await Card.find()

        // send res
        cards 
        ? res.status(200).send(cards)
        : res.status(404).send("no cards found")

    } catch (err) {
        res.status(400).send(err)        
    }
})

// GET LOGGED IN USER'S CARDS
router.get("/my-cards", auth, async(req, res) => {
    try {
        // check if user is registered
        const user = User.findById(req.payload._id)
        if (!user) return res.status(400).send("please register")

        // get card
        const card = await Card.find({createdBy: req.payload.email})

        // return if not found
        if (!card) return res.status(404).send("no cards found")

        // handle unauthorization
        if (req.payload.email != card.createdBy) 
        return res.status(401).send("unauthorized")

        // send card
        res.status(200).send(card)

    } catch (err) {
        res.status(400).send(err)        
    }
})

// GET ANY USER'S CARD
router.get("/:id", async(req, res) => {
    try {
        // get card
        const card = await Card.find({_id: req.params.id})

        // return if not found
        if (!card) return res.status(404).send("card not found")

        // send card
        res.status(200).send(card)

    } catch (err) {
        res.status(400).send(err)        
    }
})

// EDIT CARD
router.put("/:id", auth, async(req, res) => {
    try {
        // get card
        let card = await Card.find({_id: req.params.id})
        
        // return if not found
        if (!card) return res.status(404).send("card not found")

        // handle unauthorization
        if (card.createdBy != req.params.email)
        return res.status(401).send("unauthorized")

        // edit card
        card = await Card.findOneAndUpdate({_id: req.params.id }, req.body, {new: true})

        // send edited card
        res.status(201).send(card)

    } catch (err) {
        res.status(400).send(err)        
    }
})

// LIKE FEATURE - TOGGLE USER'S ID IN LIKED ARRAY
router.patch("/:id", auth, async(req, res) => {
    try {
        // check if req came from a registered user
        const user = User.findById(req.payload._id)
        if (!user) return res.status(400).send("please register or loggin")

        // check if exists
        let card = await Card.find({_id: req.params.id})
        if (!card) return res.status(404).send("card not found")

        // get likes array
        let likesArr = card.likes

        // remove like if user._id exists
        if (likesArr.includes(req.payload._id)) 
        likesArr.splice(likesArr.indexof(req.payload._id), 1)
        
        // else add user._id
        else likesArr.push(req.payload._id)
        
        // patch card with new likes array
        card = await Card.findOneAndUpdate({_id: req.params.id}, {likes: likesArr}, {new: true})

        // send edited card
        res.status(200).send(card)

    } catch (err) {
        res.status(400).send(err)        
    }
})

// DELETE CARD
router.delete("/:id", auth, async(req, res) => {
    try {
        // get card
        let card = await Card.find({_id: req.params.id})
        
        // return if not found
        if (!card) return res.status(404).send("card not found")

        // handle unauthorization
        if (card.createdBy != req.payload.email || req.payload.isAdmin != true)
        return res.status(401).send("unauthorized")

        // delete card
        card = await Card.findOneAndDelete({_id: req.params.id })

        // return deleted card
        res.status(200).send(card)
        
    } catch (err) {
        res.status(400).send(err)        
    }
})

// BONUS CHANGE BIZNUMBER 
router.patch("/:id/biznumber", auth, async (req, res) => {
    try {
        // handle unauthorization
        if (req.payload.isAdmin != true) return res.status(401).send("unauthorized")

        // get card
        let card = await Card.find({_id: req.params.id})
        
        // return if not found
        if (!card) return res.status(404).send("card not found")

        // check if new bizNumber is taken
        let taken = await Card.find({bizNumber: req.body.bizNumber})
        if (taken) return res.status(400).send("bizNumber is taken")

        // patch bizNumber
        card = await Card.findOneAndUpdate({_id: req.params.id }, {bizNumber: req.body.bizNumber}, {new: true})

        // send patched card
        res.status(200).send(card)

    } catch (err) {
        
    }

})

module.exports = router