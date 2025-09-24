// Needed Resources
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Inventory Management Dashboard
router.get("/", utilities.handleErrors(invController.buildManagement))
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.processAddClassification)
)

// Add inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.processAddInventory))

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId))
router.get("/trigger-error", utilities.handleErrors(invController.triggerServerError))

module.exports = router
