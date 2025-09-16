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

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById}