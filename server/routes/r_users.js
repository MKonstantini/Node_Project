const express = require("express")
const router = express.Router()
const _ = require("lodash")

const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const auth = require("../middleware/auth")

// Joi object
const joi = require("joi")
const userJoiSchema = joi.object({
    name: joi.object().required(),
    email: joi.string().email().required(),
    password: joi.string().min(2).required(),
    isAdmin: joi.boolean().required(),
    isBusiness: joi.boolean().required(),
    address: joi.object(),
    phone: joi.string().min(9),
    image: joi.object()
})

// POST NEW USER
router.post("/", async (req, res) => {
    try {
        // joi validation
        const {error} = userJoiSchema.validate(req.body)
        if (error) return res.status(400).send(error) 

        // check if exists - mongoose findOne()
        let user = await User.findOne({email : req.body.email})
        if (user) return res.status(400).send("user already exists")

        // create user
        user = new User(req.body)

        // add createdAt field
        const dateStr = new Date().toString()
        user.createdAt = dateStr
        
        // encrypt password - bcrypt.js
        let salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
        
        // post user
        await user.save()

        // return res with token
        const token = jwt.sign({
            _id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
            isBusiness: user.isBusiness
        }, process.env.JWTKEY)
        res.status(201).send(token)
        
    } catch (err) {
        res.status(400).send(err)
    }
})

// USER LOGIN
router.post("/login", async (req, res) => {
    try {
        // validate body - joi
        const {error} = loginJoiSchema.validate(req.body)
        if (error) return res.status(400).send(error) 

        // check if user exists - findOne()
        let user = await User.findOne({email: req.body.email})
        if (!user) return res.status(404).send("wrong email or password")

        // check password with encryption - bcrypt.compare()
        const result = await bcrypt.compare(req.body.password, user.password)
        if (!result) return res.status(404).send("wrong email or pasword")

        // return res with token
        const token = jwt.sign({
            _id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
            isBusiness: user.isBusiness        
        }, process.env.JWTKEY)
        res.status(200).send(token)
        
    } catch (err) {
        res.status(400).send(err)
    }
})

// GET ALL USERS' DATA
router.get("/", auth, async(req, res) => {
    try {
        // check if admin
        if (req.payload.isAdmin != true) 
        return res.status(401).send("unauthorized")

        // get all users from DB
        const users = await User.find()

        // send res
        users 
        ? res.status(200).send(users)
        : res.status(404).send("no users found")

    } catch (err) {
        res.status(400).send(err)        
    }
})

// GET ONE USER'S DATA
router.get("/:id", auth, async(req, res) => {
    try {
        // handle unauthorization
        if (req.payload._id != req.params.id && req.payload.isAdmin != true) 
        return res.status(401).send("unauthorized")

        // get user
        const user = await User.findById(req.params.id)

        // return if not found
        if (!user) return res.status(404).send("user not found")

        // send profile info
        res.status(200).send(_.pick(user, [
            "_id", 
            "name",
            "email",
            // omit password
            "isAdmin",
            "isBusiness",
            // omit non-required fields
        ]))
    } catch (err) {
        res.status(400).send(err)        
    }
})

// EDIT USER (PUT USER)
router.put("/:id", auth, async(req, res) => {
    try {
        // handle unauthorization
        if (req.payload._id != req.params.id) 
        return res.status(401).send("unauthorized")

        // put user
        const user = await User.findOneAndUpdate({_id: req.params.id }, req.body, {new: true})
        
        // return if not found
        if (!user) return res.status(404).send("user not found")

        // send profile info
        res.status(201).send(_.pick(user, [
            "_id", 
            "name",
            "email",
            // omit password
            "isAdmin",
            "isBusiness",
            // omit non-required fields
        ]))

    } catch (err) {
        res.status(400).send(err)        
    }
})

// CHANGE BUSINESS STATUS (PATCH USER)
router.patch("/:id", auth, async(req, res) => {
    try {
        // handle unauthorization
        if (req.payload._id != req.params.id) 
        return res.status(401).send("unauthorized")

        // patch is business field
        const user = await User.findOneAndUpdate({_id: req.params.id }, {isBusiness: req.body.isBusiness}, {new: true})
        
        // return if not found
        if (!user) return res.status(404).send("user not found")

        // send profile info
        res.status(200).send(_.pick(user, [
            "_id", 
            "name",
            "email",
            // omit password
            "isAdmin",
            "isBusiness",
            // omit non-required fields
        ]))

    } catch (err) {
        res.status(400).send(err)        
    }
})

// DELETE USER
router.delete("/:id", auth, async(req, res) => {
    try {
        // handle unauthorization
        if (req.payload._id != req.params.id && req.payload.isAdmin != true) 
        return res.status(401).send("unauthorized")

        // delete user
        const user = await User.findOneAndDelete({_id: req.params.id })
        
        // return if not found
        if (!user) return res.status(404).send("user not found")

        // return user
        res.status(200).send(user)
        
    } catch (err) {
        res.status(400).send(err)        
    }
})

module.exports = router