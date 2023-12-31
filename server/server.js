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
.connect(process.env.DB || process.env.LocalDB, {useNewUrlParser: true}) 
.then(() => console.log("connected to MongoDB database"))
.catch((err) => console.log(err))

// API
// Morgan
const morgan = require("morgan")
app.use(morgan("combined"))

// Chalk - chalk "not supported" - code: 'ERR_REQUIRE_ESM'
// const chalk = require("chalk")
// console.log(chalk.blue("chalk installed"))

// express middlewares
app.use(express.json())
app.use(express.urlencoded({extended : true}))
// routes
const r_users = require("./routes/r_users")
app.use("/api/users", r_users)
const r_cards = require("./routes/r_cards")
app.use("/api/cards", r_cards)

// public folder redirect
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// static folder
app.use(express.static(__dirname + "/public/index.html"));
app.use(express.static(__dirname + 'public'));

// testing
app.get("/api/test", (req, res) => {
    try {res.status(200).send("test complete")} 
    catch (err) {res.status(400).send(err)}
})
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
