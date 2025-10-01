const pool = require("../database/")

/* *************************************
 *  Register a new account
 * ************************************ */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO public.account
        (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *
    `
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    throw error
  }
}

/* **********************
 * Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT 1 FROM public.account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rowCount
  } catch (error) {
    throw error
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail (account_email) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
    FROM public.account
    WHERE account_email = $1
  `
  const result = await pool.query(sql, [account_email])
  return result.rows[0] || null
}

/* *****************************
 * Updating account first/last/email information
 * ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  const sql = `
    UPDATE public.account
       SET account_firstname = $2,
           account_lastname  = $3,
           account_email     = $4
     WHERE account_id = $1
     RETURNING account_id, account_firstname, account_lastname, account_email, account_type
  `
  try {
    const result = await pool.query(sql, [account_id, account_firstname, account_lastname, account_email])
    return result
  } catch (error) {
    throw error
  }
}

/* *****************************
 * Updating account password
 * ***************************** */
async function updatePassword(account_id, hashedPassword) {
  const sql = `
    UPDATE public.account
       SET account_password = $2
     WHERE account_id = $1
     RETURNING account_id
  `
  try {
    const result = await pool.query(sql, [account_id, hashedPassword])
    return result
  } catch (error) {
    throw error
  }
}

/* *****************************
 * Get account by id
 * ***************************** */
async function getAccountById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type
    FROM public.account
    WHERE account_id = $1
  `
  const result = await pool.query(sql, [account_id])
  return result.rows[0] || null
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateAccount,
  updatePassword,
  getAccountById,
}
