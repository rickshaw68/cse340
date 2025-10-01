const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* **********************************************
 * Constructs the nav HTML unordered list
 * ********************************************** */
Util.getNav = async function (req, res, next) {
  const url = req?.originalUrl || "/"
  const data = await invModel.getClassifications()
  let list = "<ul>"
  list += `<li><a href="/" title="Home page"${url === "/" ? ' class="active"' : ""}>Home</a></li>`
  data.rows.forEach((row) => {
    const path = `/inv/type/${row.classification_id}`
    const isActive = url === path
    list += `<li><a href="${path}" title="See our inventory of ${row.classification_name} vehicles"${isActive ? ' class="active"' : ""}>${row.classification_name}</a></li>`
  })

  list += "</ul>"
  return list
}

/* **********************************************
 * Build the classification view in HTML
 * ********************************************** */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<img src="' 
        + vehicle.inv_thumbnail 
        + '" alt="' 
        + vehicle.inv_make 
        + ' ' 
        + vehicle.inv_model 
        + ' thumbnail">'
      grid += '<div class="namePrice">'
      grid += '<hr>'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **********************************************
 * Build the single vehicle detail view in HTML
 * ********************************************** */
Util.buildVehicleDetail = function (vehicle) {
  const priceUSD = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.inv_price)

  const miles = vehicle.inv_miles != null
    ? new Intl.NumberFormat("en-US").format(vehicle.inv_miles)
    : "N/A"

  return `
    <section class="vehicle-detail">
      <div class="vehicle-media">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}, front and side view">
      </div>

      <div class="vehicle-info">
        <p class="vehicle-price"><span class="sr-only">Price: </span>${priceUSD}</p>
        <ul class="vehicle-specs">
          <li><strong>Year:</strong> ${vehicle.inv_year}</li>
          <li><strong>Make:</strong> ${vehicle.inv_make}</li>
          <li><strong>Model:</strong> ${vehicle.inv_model}</li>
          <li><strong>Color:</strong> ${vehicle.inv_color || "N/A"}</li>
          <li><strong>Mileage:</strong> ${miles}</li>
          <li><strong>Classification:</strong> ${vehicle.classification_name || "N/A"}</li>
        </ul>
        <div class="vehicle-description">
          <h2>About this vehicle</h2>
          <p>${vehicle.inv_description || "No description available."}</p>
        </div>
      </div>
    </section>
  `
}

/* **********************************************
 * buildClassificationList function
 * added because the I didn't already have a helper function for this
 * ********************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()

  let list = '<select id="classificationList" name="classification_id" required>'
  list += '<option value="">Choose a Classification</option>'

  data.rows.forEach((row) => {
    const selected = String(row.classification_id) === String(classification_id) ? ' selected' : ''
    list += `<option value="${row.classification_id}"${selected}>${row.classification_name}</option>`
  })

  list += '</select>'
  return list
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWToken = (req, res, next) => {
  res.locals.loggedin = false
  res.locals.accountData = null
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = true
        next()
      })
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check role: Employee or Admin
 * *************************************** */
Util.checkEmployeeOrAdmin = (req, res, next) => {
  const loggedin = !!res.locals.loggedin
  const type = res.locals.accountData?.account_type
  if (!loggedin) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
  if (type === "Employee" || type === "Admin") {
    return next()
  }
  req.flash("notice", "You do not have permission to access that page")
  return res.redirect("/account/login")
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util