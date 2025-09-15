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
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util