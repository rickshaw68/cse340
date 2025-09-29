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
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav(req)
  const messages = req.flash ? req.flash("notice") : []
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    messages,
    classificationSelect
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav(req)
  const messages = req.flash ? req.flash("notice") : []
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    messages,
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.processAddClassification = async function (req, res, next) {
  const { classification_name } = req.body
  try {
    const result = await invModel.addClassification(classification_name)
    if (result && (result.rowCount > 0 || result.success || result.rows?.length)) {
      if (req.flash) {
        req.flash("notice", `Classification "${classification_name}" added successfully.`)
      }
      return res.redirect("/inv")
    }
    const nav = await utilities.getNav(req)
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      messages: [`Unable to add classification "${classification_name}". Please try again.`],
      classification_name, // <-- makes the sticky form
    })
  } catch (err) {
    const nav = await utilities.getNav(req)
    const fail = err?.code === "23505" ? 
      `The classification name "${classification_name}" already exists.` :
      `Error adding classification. ${err.message || "Please try again."}`

    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      messages: [fail],
      classification_name, // <-- makes the sticky form
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav(req)
  const messages = req.flash ? req.flash("notice") : []
  const classData = await invModel.getClassifications()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    errors: null,
    messages,
    classifications: classData.rows,
    classification_id: null,
  })
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.processAddInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_miles,
    inv_color,
    inv_image,
    inv_thumbnail,
    inv_description,
  } = req.body
  try {
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      inv_description,
    })

    if (result && (result.rowCount > 0 || result.success || result.rows?.length)) {
      if (req.flash) {
        req.flash("notice", `Vehicle "${inv_make} ${inv_model}" added successfully.`)
      }
      return res.redirect("/inv")
  }
    const nav = await utilities.getNav(req)
    const classData = await invModel.getClassifications()
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
      messages: [`Unable to add vehicle "${inv_make} ${inv_model}". Please try again.`],
      classifications: classData.rows,
      classification_id, // <-- makes the sticky form
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      inv_description,
    })
  } catch (err) {
    const nav = await utilities.getNav(req)
    const classData = await invModel.getClassifications()
    const msg = err?.message ? `Error adding vehicle. ${err.message}` : "Error adding vehicle. Please try again."
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
      messages: [msg],
      classifications: classData.rows,
      classification_id, // <-- makes the sticky form
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      inv_description,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id, 10)
  if (Number.isNaN(classification_id)) {
    return res.status(400).json({ error: "Invalid classification id" })
  }

  try {
    const invData = await invModel.getInventoryByClassificationId(classification_id)

    if (Array.isArray(invData) && invData.length > 0) {
      return res.json(invData)
    }
    return res.status(404).json({ error: "No data returned" })
  } catch (err) {
    return next(err)
  }
}

/* ***************************
 *  Build "Edit Inventory" view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const nav = await utilities.getNav(req)
  const messages = req.flash ? req.flash("notice") : []

  // Collect the incoming inventory_id as an integer
  const inv_id = parseInt(req.params.inv_id, 10)
  if (Number.isNaN(inv_id)) {
    return next(new Error("Invalid inventory id"))
  }

  // Get all item data for the inventory_id
  const data = await invModel.getVehicleById(inv_id)
  if (!data.rows || data.rows.length === 0) {
    return next(new Error("Vehicle not found"))
  }
  const vehicle = data.rows[0]

  // Create a name for title (Make + Model)
  const name = `${vehicle.inv_make} ${vehicle.inv_model}`

  // Build the classification 
  const classificationSelect = await utilities.buildClassificationList(vehicle.classification_id)

  // Render the edit view 
  return res.render("inventory/edit-inventory", {
    title: `Edit ${name}`,
    nav,
    messages,
    errors: null,
    classificationSelect,

    // Fields to prefill the form
    inv_id: vehicle.inv_id,
    classification_id: vehicle.classification_id,
    inv_make: vehicle.inv_make,
    inv_model: vehicle.inv_model,
    inv_year: vehicle.inv_year,
    inv_price: vehicle.inv_price,
    inv_miles: vehicle.inv_miles,
    inv_color: vehicle.inv_color,
    inv_image: vehicle.inv_image,
    inv_thumbnail: vehicle.inv_thumbnail,
    inv_description: vehicle.inv_description,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav(req)
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  try {
    const updateResult = await invModel.updateInventory(
      Number(inv_id),
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    const ok =
      updateResult &&
      (updateResult.rowCount > 0 ||
        updateResult.success === true ||
        (Array.isArray(updateResult.rows) && updateResult.rows.length > 0))

    if (ok) {
      const itemName = `${inv_make} ${inv_model}`
      if (req.flash) req.flash("notice", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv")
    }

    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    if (req.flash) req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  } catch (err) {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    if (req.flash) req.flash("notice", "Sorry, the update failed.")
    return res.status(500).render("inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
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
