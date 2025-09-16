const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav(req)
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build a vehicle detail view
 * ************************** */
async function buildByInvId(req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getVehicleById(inv_id)

  if (!data.rows || data.rows.length === 0) {
    return res.status(404).render("errors/404", {
      title: "The vehicle you are searching for was not found.",
      nav: await utilities.getNav(req),
  })
  }

  const vehicle = data.rows[0]
  const nav = await utilities.getNav(req)
  const detail = await utilities.buildVehicleDetail(vehicle)

  res.render("./inventory/detail", {
    title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    detail,
  })
}

/* ***************************
 *  Intentional trigger for a 500 error
 * ************************** */

async function triggerServerError(req, res, next) {
  throw new Error("Intentional Server Error for Testing")
}

invCont.triggerServerError = triggerServerError
invCont.buildByInvId = buildByInvId
module.exports = invCont
