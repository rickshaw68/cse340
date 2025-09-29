const pool = require("../database/")

/* *************************************
 *  Get all classification data
 * ************************************ */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* *************************************
 *  Get inventory items and  classification_name by classification_id
 * ************************************ */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id            
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

/* *************************************
 * Get a single vehicle by inv_id
 * ************************************ */
async function getVehicleById(inv_id) {
    const sql = `
        SELECT i.inv_id,
               i.inv_make,
               i.inv_model,
               i.inv_year,
               i.inv_price,
               i.inv_description,
               i.inv_image,
               i.inv_thumbnail,
               i.inv_miles,
               i.inv_color,
               i.classification_id,
               c.classification_name
        FROM public.inventory i
        LEFT JOIN public.classification c
             ON c.classification_id = i.classification_id
        WHERE i.inv_id = $1
        `
        return pool.query(sql, [inv_id])    
}

/* *************************************
 * inventory-model functions
 * ************************************ */
async function addClassification(classification_name) {
    const sql = `INSERT INTO public.classification (classification_name)
        VALUES ($1) RETURNING classification_id, classification_name`
    const result = await pool.query(sql, [classification_name])
    return result
}

/* *************************************
 * add a new vehicle to inventory
 * ************************************ */
async function addInventory(v) {
    const sql = `
    INSERT INTO public.inventory
    (inv_make, inv_model, inv_year, inv_price, inv_description, inv_image, inv_thumbnail, 
    inv_miles, Inv_color, classification_id)     
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING inv_id;`

    const values = [
        v.inv_make,
        Number(v.inv_model) ? Number(v.inv_model) : v.inv_model,
        Number(v.inv_year),
        Number(v.inv_price),
        v.inv_description,
        v.inv_image,
        v.inv_thumbnail,
        Number(v.inv_miles),
        v.inv_color,
        Number(v.classification_id),
    ]
    return pool.query(sql, values)
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
         SET inv_make = $2,
             inv_model = $3,
             inv_description = $4,
             inv_image = $5,
             inv_thumbnail = $6,
             inv_price = $7,
             inv_year = $8,
             inv_miles = $9,
             inv_color = $10,
             classification_id = $11
       WHERE inv_id = $1
       RETURNING inv_id, inv_make, inv_model
    `
    const params = [
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
    ]
    return pool.query(sql, params)
  } catch (error) {
    console.error("model error: " + error)
    throw error
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory, updateInventory}