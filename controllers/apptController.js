const utilities = require("../utilities/")
const apptModel = require("../models/appointment-model")
const invModel = require("../models/inventory-model")

async function buildNew(req, res, next) {
  const nav = await utilities.getNav(req)
  const { inv_id } = req.params
  const vehicle = await invModel.getVehicleById(inv_id)
  res.render("appointment/new", {
    title: "Book A Test Drive",
    nav,
    vehicle: vehicle?.rows?.[0],
    errors: null,
    values: { inv_id }
  })
}

async function create(req, res, next) {
  const nav = await utilities.getNav(req)
  const { inv_id, appt_date, appt_start, appt_end, notes } = req.body
  const account_id = res.locals.accountData?.account_id
  if (!account_id) {
    req.flash("notice", "Please log in")
    return res.redirect("/account/login")
  }

  // Validation on server
  const errs = []
  if (!inv_id || !appt_date || !appt_start || !appt_end) {
    errs.push({ msg: "All fields are required." })
  }

  // check time
  if (appt_start && appt_end && appt_end <= appt_start) {
    errs.push({ msg: "End time must be after start time." })
  }

  // check date
  const today = new Date().toISOString().slice(0, 10)
  if (appt_date && appt_date < today) {
    errs.push({ msg: "Date cannot be in the past." })
  }

  if (errs.length) {
    return res.status(400).render("appointment/new", {
      title: "Book A Test Drive",
      nav,
      errors: errs,
      values: { inv_id, appt_date, appt_start, appt_end, notes }
    })
  }

  // business rules
  const hasSameDay = await apptModel.hasUserAppointmentSameDay({ account_id, appt_date })
  if (hasSameDay.rowCount) {
    return res.status(409).render("appointment/new", {
      title: "Book A Test Drive",
      nav,
      errors: [{ msg: "You already have a scheduled appointment that day." }],
      values: { inv_id, appt_date, appt_start, appt_end, notes }
    })
  }

  const conflicts = await apptModel.findConflicts({ inv_id, appt_date, appt_start, appt_end })
  if (conflicts.rowCount) {
    return res.status(409).render("appointment/new", {
      title: "Book A Test Drive",
      nav,
      errors: [{ msg: "That time slot is already booked for this vehicle." }],
      values: { inv_id, appt_date, appt_start, appt_end, notes }
    })
  }

  await apptModel.createAppointment({ account_id, inv_id, appt_date, appt_start, appt_end, notes })
  req.flash("notice", "Appointment scheduled!")
  res.redirect("/appointment/mine")
}

async function listMine(req, res, next) {
  const nav = await utilities.getNav(req)
  const appts = await apptModel.listByAccount(res.locals.accountData.account_id)
  res.render("appointment/mine", {
    title: "My Appointments",
    nav,
    appts: appts.rows,
    errors: null
  })
}

async function manage(req, res, next) {
  const nav = await utilities.getNav(req)
  const from = new Date().toISOString().slice(0, 10)
  const to = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)
  const appts = await apptModel.listForManager({ from_date: from, to_date: to })
  res.render("appointment/manage", {
    title: "Appointments This Week",
    nav,
    appts: appts.rows,
    errors: null
  })
}

async function cancelOwn(req, res, next) {
  await apptModel.cancelOwnAppointment(req.params.appt_id, res.locals.accountData.account_id)
  req.flash("notice", "Appointment cancelled.")
  res.redirect("/appointment/mine")
}

async function cancelStaff(req, res, next) {
  await apptModel.cancelByStaff(req.params.appt_id)
  req.flash("notice", "Appointment cancelled.")
  res.redirect("/appointment/manage")
}

async function complete(req, res, next) {
  await apptModel.markAppointmentCompleted(req.params.appt_id)
  req.flash("notice", "Appointment marked as completed.")
  res.redirect("/appointment/manage")
}

// appointment details
async function show(req, res, next) {
  const nav = await utilities.getNav(req)
  const appt_id = req.params.appt_id
  const { accountData } = res.locals
  const result = await apptModel.getById(appt_id)
  if (!result.rowCount) {
    req.flash("notice", "Appointment not found")
    return res.redirect("/appointment/mine")
  }
  const appt = result.rows[0]

  // add authorization of who can view which appointments i.e. employees-all, user-only their own
  const isStaff = accountData?.account_type === "Employee" || accountData?.account_type === "Admin"
  if (!isStaff && appt.account_id !== accountData.account_id) {
    req.flash("notice", "You do not have permission to view that appointment")
    return res.redirect("/appointment/mine")
  }

  res.render("appointment/show", {
    title: `Appointment #${appt.appt_id}`,
    nav,
    appt,
    isStaff,
    errors:null,
    messages: req.flash("notice")
  })
}

module.exports = { buildNew, create, listMine, manage, cancelOwn, cancelStaff, complete, show }