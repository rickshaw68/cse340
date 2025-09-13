// Needed Resources
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

module.exports = router
