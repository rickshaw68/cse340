// Needed Resources
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Inventory Management Dashboard
router.get("/", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))
router.get("/add-classification", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification))
router.post(
    "/add-classification",
    utilities.checkEmployeeOrAdmin,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.processAddClassification)
)

// Add inventory
router.get("/add-inventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory))
router.post(
    "/add-inventory",
    utilities.checkEmployeeOrAdmin,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.processAddInventory))

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId))
router.get("/trigger-error", utilities.handleErrors(invController.triggerServerError))

// Return inventory for a classification as JSON
router.get(
  "/getInventory/:classification_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Add inventory view
router.get(
  "/edit/:inv_id",
  utilities.checkEmployeeOrAdmin, 
  utilities.handleErrors(invController.buildEditInventory)
)

// Process the update inventory
router.post(
  "/update",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Delete inventory confirmation view
router.get(
  "/delete/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteConfirm)  
)

// Delete inventory - actual delete
router.post(
  "/delete",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
)

module.exports = router
