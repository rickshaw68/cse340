/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
require("dotenv").config()
const path = require("path")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const static = require("./routes/static") 
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require("./database/")
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const appointmentRoute = require("./routes/appointmentRoute")

const app = express()

/* ***********************
 * View Engine and Templates
 *************************/
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Middleware
 *************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) //for parsing application/x-www-form-urlencoded

// cookie-parser
app.use(cookieParser())

// check JWT token
app.use(utilities.checkJWToken)

/* ***********************
 * Routes
 *************************/
app.use(static)
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)
app.use("/appointment", appointmentRoute)
app.use(async (req, res, next) => {
  next({status: 404, message: "Good news: You found the error page! Bad news: It's not what you were looking for"})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav(req)
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  console.error(err.stack || err)
  let message
  if(err.status == 404){ message = err.message } else { message = 'Oh no! There was a crash. Maybe try a different link?' }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`)
})
