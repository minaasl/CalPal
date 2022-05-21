const express = require("express");
const router = express.Router();
router
    .route("/")
    .get((req, res) => res.send("blogs"))
    .post((req, res) => res.send("POST"));
module.exports = router;