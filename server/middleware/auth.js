// MIDDLEWARE THAT COPIES TOKEN DATA FROM REQ.HEADER TO REQ.PAYLOAD
const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    try {
        // take token from header
        const token = req.header("Authorization")
        if (!token) return res.status(400).send("no valid token")

        // validate token
        const payload = jwt.varify(token, process.env.JWTKEY)

        // save token in payload
        req.payload = payload

        // finalize
        next()

    } catch (err) {
        res.status(400).send(err)
        
    }
}