const invModel = require("../models/inventory-model")
const Util = {}

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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util