const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}
  const accountModel = require("../models/account-model")  

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists.  Please log in or use a different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail().withMessage("Please provide a valid email address.")
      .normalizeEmail(),
    body("account_password")
      .trim()
      .notEmpty().withMessage("Please provide a password.")
  ]
}

/* ******************************
 * Check the login data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors,                 
      account_email,         
    })
  }
  next()
}

validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim().escape().notEmpty().isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim().notEmpty().isEmail().normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (value, { req }) => {
        // Allow the same email; but block it if the email belongs to another user
        const existing = await accountModel.getAccountByEmail(value)
        if (existing && Number(existing.account_id) !== Number(req.body.account_id)) {
          throw new Error("That email is already in use.")
        }
      }),
    body("account_id")
      .toInt().isInt({ gt: 0 }).withMessage("Invalid account id."),
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav(req)
  return res.status(400).render("account/update", {
    title: "Update Account",
    nav,
    errors,
    account: res.locals.accountData, // so the page has context    
    account_firstname: req.body.account_firstname,
    account_lastname: req.body.account_lastname,
    account_email: req.body.account_email,
  })
}

/*  **********************************
 *  Update Password
 * ********************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
      .withMessage("Password does not meet requirements."),
    body("account_id")
      .toInt().isInt({ gt: 0 }).withMessage("Invalid account id."),
  ]
}

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav(req)
  return res.status(400).render("account/update", {
    title: "Update Account",
    nav,
    errors,
    account: res.locals.accountData,    
    account_firstname: req.body.account_firstname ?? res.locals.accountData?.account_firstname,
    account_lastname:  req.body.account_lastname  ?? res.locals.accountData?.account_lastname,
    account_email:     req.body.account_email     ?? res.locals.accountData?.account_email,
  })
}

module.exports = validate