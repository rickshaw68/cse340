const pool = require("../database/")

/* ****************************************
 * Insert a new appointment
 * **************************************** */
async function createAppointment({ account_id, inv_id, appt_date, appt_start, appt_end, notes}) {
    const sql = `
        INSERT INTO public.appointment
            (account_id, inv_id, appt_date, appt_start, appt_end, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `
    const vals = [account_id, inv_id, appt_date, appt_start, appt_end, notes ?? null]
    return pool.query(sql, vals)
}

/* ****************************************
 * Check for appointment conflict
 * **************************************** */
async function findConflicts({ inv_id, appt_date, appt_start, appt_end }) {
    const sql = `
        SELECT appt_id, inv_id, appt_date, appt_start, appt_end
        FROM public.appointment
        WHERE inv_id = $1
            AND appt_date = $2
            AND appt_status = 'Scheduled'
            AND NOT ($4 <= appt_start OR $3 >= appt_end)
    `
    const vals = [inv_id, appt_date, appt_start, appt_end]
    return pool.query(sql, vals)
}

/* ****************************************
 * Only one appointment per day per account
 * **************************************** */
async function hasUserAppointmentSameDay({ account_id, appt_date }) {
    const sql = `
        SELECT 1
        FROM public.appointment
        WHERE account_id = $1
            AND appt_date = $2
            AND appt_status = 'Scheduled'
        LIMIT 1
    `
    return pool.query(sql, [account_id, appt_date])
}

/* ****************************************
 * Get existing appointments for the user
 * **************************************** */
async function listByAccount(account_id) {
    const sql = `
        SELECT a.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price
        FROM public.appointment a
            JOIN public.inventory i USING (inv_id)
        WHERE a.account_id = $1
        ORDER BY a.appt_date ASC, a.appt_start ASC
    `
    return pool.query(sql, [account_id])
}

/* ****************************************
 * Manager/Employee list of appointments
 * **************************************** */
async function listForManager({ from_date, to_date }) {
    const sql = `
        SELECT a.*,
            i.inv_make, i.inv_model, i.inv_year,
            acc.account_firstname, acc.account_lastname, acc.account_email
        FROM public.appointment a
            JOIN public.inventory i USING (inv_id)
            JOIN public.account acc USING (account_id)
        WHERE a.appt_date BETWEEN $1 AND $2
        ORDER BY a.appt_date ASC, a.appt_start ASC
    `
    return pool.query(sql, [from_date, to_date])
}

/* ****************************************
 * Cancel appointment - User
 * **************************************** */
async function cancelOwnAppointment(appt_id, account_id) {
    const sql = `
        UPDATE public.appointment
            SET appt_status = 'Cancelled'
        WHERE appt_id = $1
            AND account_id = $2
            AND appt_status = 'Scheduled'
        RETURNING *
    `
    return pool.query(sql, [appt_id, account_id])
}

/* ****************************************
 * Cancel appointment - Manager/Employee
 * **************************************** */
async function cancelByStaff(appt_id) {
    const sql = `
        UPDATE public.appointment
            SET appt_status = 'Cancelled'
        WHERE appt_id = $1
            AND appt_status = 'Scheduled'
        RETURNING *
    `
    return pool.query(sql, [appt_id])
}

/* ****************************************
 * Mark appointment as completed
 * **************************************** */
async function markAppointmentCompleted(appt_id) {
    const sql = `
        UPDATE public.appointment
            SET appt_status = 'Completed'
        WHERE appt_id = $1
            AND appt_status = 'Scheduled'
        RETURNING *
    `
    return pool.query(sql, [appt_id])
}

/* ****************************************
 * Get appointment details
 * **************************************** */
async function getById(appt_id) {
    const sql = `
        SELECT a.*,
            i.inv_make, i.inv_model, i.inv_year,
            acc.account_firstname, acc.account_lastname
        FROM public.appointment a
            JOIN public.inventory i USING (inv_id)
            JOIN public.account acc USING (account_id)
        WHERE a.appt_id = $1
        LIMIT 1
    `
    return pool.query(sql, [appt_id])
}

module.exports = {createAppointment, findConflicts, hasUserAppointmentSameDay, listByAccount,
    listForManager, cancelOwnAppointment, cancelByStaff, markAppointmentCompleted, getById
}