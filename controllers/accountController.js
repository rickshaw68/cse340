const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* Build the account login view */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav(req)
    res.render("account/login", {
        title: "Login",
        nav,        
    })
}

/* adding base cookie for troubleshooting */
const baseCookie = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
}
if (process.env.NODE_ENV !== "development") {
  baseCookie.secure = true
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav(req)
  const { account_firstname, account_lastname, account_email, account_password } = req.body

// Hash the password before storing
  let hashedPassword
  try {
    // regular password and const (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
    })
  }
}

async function buildManagement(req, res){
  const nav = await utilities.getNav(req)
  res.render("account/management", { 
    title: "Account Management", 
    nav,
    errors: null    
   })
}

/* ***************************************
 *  Process login request
 * ************************************* */
async function accountLogin(req, res) {
  let nav = await utilities.getNav(req)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      
      res.cookie("jwt", accessToken, { ...baseCookie, httpOnly: true, maxAge: 3600 * 1000 })
      
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      })
    }
  } catch (error) {      
      throw new Error('Access Forbidden')
  }
}

/* *************************************
 * Process logout
 ************************************* */
async function logout(req, res, next) {
  try {
    if (req.flash) req.flash("notice", "You are now logged out.")
    res.clearCookie("jwt", baseCookie) 
    return res.redirect("/")   
  } catch (err) {
    return next(err)
  }
}

/* *************************************
 * Account update view
 ************************************* */

async function buildUpdate(req, res, next) {
  const nav = await utilities.getNav(req)
  const account_id = parseInt(req.params.account_id, 10)
  if (Number.isNaN(account_id)) return next(new Error("Invalid account id"))
  return res.render("account/update", {
  title: "Update Account",
  nav,
  errors: null,
  account: res.locals.accountData,
  })
}

/* *************************************
 * process the account update
 ************************************* */
async function updateAccount(req, res, next) {
  const nav = await utilities.getNav(req)
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  try {
    const result = await accountModel.updateAccount(
      Number(account_id),
      account_firstname,
      account_lastname,
      account_email
    )
    if (result?.rowCount === 1) {
      const updated = result.rows[0]
      const payload = {
        account_id: updated.account_id,
        account_firstname: updated.account_firstname,
        account_lastname: updated.account_lastname,
        account_email: updated.account_email,
        account_type: updated.account_type,
      }
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      res.cookie("jwt", token, { ...baseCookie, maxAge: 3600 * 1000 })
      if (req.flash) req.flash("notice", "Account information updated")
      return res.redirect("/account")
    }
    // adding a fallback in case the update fails
     if (req.flash) req.flash("notice", "Update failed. Please try again.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account: res.locals.accountData,
      account_firstname,
      account_lastname,
      account_email,
    })
  } catch (err) {
    // Handle duplicate email
    const msg = err?.code === "23505"
      ? "That email is already in use. Please use a different email."
      : "There was an error updating your account."

    if (req.flash) req.flash("notice", msg)
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account: res.locals.accountData,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* *************************************
 * process the password update
 ************************************* */
async function updatePassword(req, res, next) {
  const nav = await utilities.getNav(req)
  const { account_id, account_password } = req.body

  try {
    const hash = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(Number(account_id), hash)

    if (result?.rowCount === 1) {
      if (req.flash) req.flash("notice", "Password updated.")
      return res.redirect("/account")
    }

    if (req.flash) req.flash("notice", "Password update failed. Please try again.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account: res.locals.accountData,
    })
  } catch (err) {
    if (req.flash) req.flash("notice", "There was an error updating your password.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account: res.locals.accountData,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, buildManagement, accountLogin, logout, buildUpdate, updateAccount, updatePassword }
