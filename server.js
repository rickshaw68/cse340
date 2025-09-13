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
const static = require("./routes/static") // only if assignment gave you this
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")

const app = express()

/* ***********************
 * View Engine and Templates
 *************************/
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static) // or app.use(express.static(path.join(__dirname, "public")))
app.get("/", baseController.buildHome)
app.use("/inv", inventoryRoute)

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
