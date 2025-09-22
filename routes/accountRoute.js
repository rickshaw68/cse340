// Needed Resources
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")

// Route to build account management view
router.get("/", (req, res) => res.redirect("/account/login"))
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/management", utilities.handleErrors(accountController.buildManagement))
// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Temp for login processing rather than 404 error
router.post("/login", (req, res) => {
  req.flash("notice", "Login isn’t set up yet. Please try again later.");
  return res.redirect(303, "/account/login");
});


module.exports = router
