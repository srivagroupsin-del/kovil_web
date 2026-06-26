const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const takavalSchema = Joi.object({
  id: Joi.number().integer().optional(),
  water_facility: Joi.string().allow('', null).optional(),
  drinking_water: Joi.string().allow('', null).optional(),
  bathroom: Joi.string().allow('', null).optional(),
  toilet: Joi.string().allow('', null).optional(),
  accommodation: Joi.string().allow('', null).optional(),
  power_backup: Joi.string().allow('', null).optional(),
  hot_water: Joi.string().allow('', null).optional(),
  ac_facility: Joi.string().allow('', null).optional(),
  marriage_hall: Joi.string().allow('', null).optional(),
  mandapam_image: Joi.string().allow('', null).optional(),
  mandapam_description: Joi.string().max(500).allow('', null).optional(),
  poojari_contact: Joi.string().allow('', null).optional()
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const TakavalController = (function () {
  
  const _createTakaval = async (jsonValue, callback) => {
    const { error, value } = takavalSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO takaval
          (water_facility, drinking_water, bathroom, toilet, accommodation, power_backup, hot_water, ac_facility, marriage_hall, mandapam_image, mandapam_description, poojari_contact)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.water_facility || null,
            value.drinking_water || null,
            value.bathroom || null,
            value.toilet || null,
            value.accommodation || null,
            value.power_backup || null,
            value.hot_water || null,
            value.ac_facility || null,
            value.marriage_hall || null,
            value.mandapam_image || null,
            value.mandapam_description || null,
            value.poojari_contact || null,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Takaval created successfully",
            data: { id: result.insertId },
          });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _getTakaval = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT * FROM takaval ORDER BY id DESC;
          `;
          const [rows] = await client.query(query);
          callback(null, { result: result_success, code: 200, data: rows });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _getTakavalById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT * FROM takaval WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Takaval not found" }, null);
          
          callback(null, { result: result_success, code: 200, data: rows[0] });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _updateTakaval = async (jsonValue, callback) => {
    const { error, value } = takavalSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM takaval WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Takaval not found" }, null);

          const updateQuery = `
            UPDATE takaval
            SET water_facility = ?, drinking_water = ?, bathroom = ?, toilet = ?, accommodation = ?, power_backup = ?, hot_water = ?, ac_facility = ?, marriage_hall = ?, mandapam_image = ?, mandapam_description = ?, poojari_contact = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.water_facility || null,
            value.drinking_water || null,
            value.bathroom || null,
            value.toilet || null,
            value.accommodation || null,
            value.power_backup || null,
            value.hot_water || null,
            value.ac_facility || null,
            value.marriage_hall || null,
            value.mandapam_image || null,
            value.mandapam_description || null,
            value.poojari_contact || null,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Takaval updated successfully" });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _deleteTakaval = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM takaval WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Takaval not found" }, null);

          const deleteQuery = `DELETE FROM takaval WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Takaval deleted successfully" });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  return {
    CreateTakaval: _createTakaval,
    GetTakaval: _getTakaval,
    GetTakavalById: _getTakavalById,
    UpdateTakaval: _updateTakaval,
    DeleteTakaval: _deleteTakaval,
  };
})();

module.exports = TakavalController;
