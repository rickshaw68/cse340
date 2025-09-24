const { body, validationResult } = require("express-validator")
const utilities = require("../utilities")
const invModel = require("../models/inventory-model")

const invValidate = {}

invValidate.classificationRules = () => [
    body("classification_name")
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage("Classification name is required (30 characters max).")
        .matches(/^[A-Za-z0-9]+$/)
        .withMessage("Use letters and numbers only (no spaces or special characters).")        
]

/* Sticky input and error handling */
invValidate.checkClassificationData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav(req)
        const messages = req.flash ? req.flash("notice") : []
        return res.status(400).render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors,
            messages,
            classification_name: req.body.classification_name || "",
        })
    }
    next()
}

/* rules for adding inventory */
invValidate.inventoryRules = () => [
  body("classification_id").trim().toInt().isInt({ min: 1 }).withMessage("Please select a classification."),
  body("inv_make")
    .trim().isLength({ min: 1, max: 50 }).withMessage("Make is required (1-50 characters).")
    .matches(/^[A-Za-z0-9 ]+$/).withMessage("Make: letters, numbers, spaces only."),
  body("inv_model")
    .trim().isLength({ min: 1, max: 50 }).withMessage("Model is required (1-50 characters).")
    .matches(/^[A-Za-z0-9 ]+$/).withMessage("Model: letters, numbers, spaces only."),
  body("inv_year").toInt().isInt({ min: 1900, max: 2100 }).withMessage("Year must be between 1900 and 2100."),
  body("inv_price").toFloat().isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").toInt().isInt({ min: 0 }).withMessage("Miles must be a whole number."),
  body("inv_color")
    .trim().isLength({ min: 1, max: 30 }).withMessage("Color is required (1-30 characters).")
    .matches(/^[A-Za-z ]+$/).withMessage("Color: letters and spaces only."),
  body("inv_image").trim().isLength({ min: 1, max: 255 }).withMessage("Main image path is required."),
  body("inv_thumbnail").trim().isLength({ min: 1, max: 255 }).withMessage("Thumbnail image path is required."),
  body("inv_description").trim().isLength({ min: 10, max: 2000 }).withMessage("Description 10-2000 characters."),
]

invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(req)
    const classData = await invModel.getClassifications()
    const messages = req.flash ? req.flash("notice") : []
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors,
      messages,
      classifications: classData.rows,
      
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_description: req.body.inv_description,
    })
  }
  next()
}

module.exports = invValidate