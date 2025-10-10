const express = require("express")
const router = new express.Router()
const apptController = require("../controllers/apptController")
const utilities = require("../utilities")

// user routes
router.get("/new/:inv_id", utilities.checkLogin, utilities.handleErrors(apptController.buildNew))
router.post("/create", utilities.checkLogin, utilities.handleErrors(apptController.create))
router.get("/mine", utilities.checkLogin, utilities.handleErrors(apptController.listMine))

// employee&Manager routes
router.get("/manage", utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(apptController.manage))
router.post("/cancel/:appt_id", utilities.checkLogin, utilities.handleErrors(apptController.cancelOwn))
router.post("/staff/cancel/:appt_id", utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(apptController.cancelStaff))
router.post("/staff/complete/:appt_id", utilities.checkLogin, utilities.checkEmployeeOrAdmin, utilities.handleErrors(apptController.complete))

// appointment detail route
router.get("/:appt_id", utilities.checkLogin, utilities.handleErrors(apptController.show))

module.exports = router