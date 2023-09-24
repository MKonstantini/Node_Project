const express = require("express")
const app = express()

// CORS
const cors = require("cors")
app.use(cors())

// PORT
require("dotenv").config({path: __dirname + '/.env'})
const port = process.env.PORT || 8001
app.listen(port, () => console.log(`connected to port http://localhost:${port}`))

// DB - Mongoose
const mongoose = require("mongoose")
mongoose
.connect(process.env.DB, {useNewUrlParser: true}) 
.then(() => console.log("connected to database MK-Cluster"))
.catch((err) => console.log(err))

// API
// middleware
app.use(express.json())
app.use(express.urlencoded({extended : true}))
// routes
const r_users = require("./routes/r_users")
app.use("/api/users", r_users)
const r_cards = require("./routes/r_cards")
app.use("/api/cards", r_cards)
// testing
app.get("/api/test", (req, res) => {
    try {res.status(200).send("test complete")} 
    catch (err) {res.status(400).send(err)}
})