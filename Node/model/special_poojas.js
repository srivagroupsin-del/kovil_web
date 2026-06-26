const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

const specialPoojasSchema = Joi.object({
  repeat_type: Joi.string().allow('', null).optional(),
  ritual_change: Joi.string().allow('', null).optional(),
  deity_selection: Joi.string().allow('', null).optional(),
  transport: Joi.string().allow('', null).optional(),
  deity_id: Joi.string().allow('', null).optional(),
  title: Joi.string().allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
  date: Joi.date().allow('', null).optional(),
  time: Joi.string().pattern(timeRegex).allow('', null).optional(),
  day: Joi.string().allow('', null).optional(),
  ritual_types: Joi.string().allow('', null).optional(),
  worship_method: Joi.string().allow('', null).optional(),
  benefits: Joi.string().allow('', null).optional(),
  prayers: Joi.string().allow('', null).optional(),
  overall_note: Joi.string().allow('', null).optional(),
  special_day_name: Joi.string().allow('', null).optional(),
  departure_time: Joi.string().pattern(timeRegex).allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(), // Handled custom logic below for backwards compatibility
  id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional(), // For React compatibility
  ritualTypes: Joi.string().allow('', null).optional(), // For React compatibility
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const SpecialPoojasController = (function () {
  
  const _createSpecialPoojas = async (jsonValue, callback) => {
    const { error, value } = specialPoojasSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    // Map camelCase to snake_case for DB compatibility
    const finalTempleId = value.temple_id || value.templeId;
    const finalRitualTypes = value.ritual_types || value.ritualTypes || null;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO special_poojas
          (repeat_type, ritual_change, deity_selection, transport, deity_id, title, notes, date, time, day, ritual_types, worship_method, benefits, prayers, overall_note, special_day_name, departure_time, status, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.repeat_type || null,
            value.ritual_change || null,
            value.deity_selection || null,
            value.transport || null,
            value.deity_id || null,
            value.title || null,
            value.notes || null,
            value.date ? new Date(value.date) : null,
            value.time || null,
            value.day || null,
            finalRitualTypes,
            value.worship_method || null,
            value.benefits || null,
            value.prayers || null,
            value.overall_note || null,
            value.special_day_name || null,
            value.departure_time || null,
            value.status || null,
            finalTempleId,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Special Poojas created successfully",
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

  const _getSpecialPoojas = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, repeat_type, ritual_change, deity_selection, transport, deity_id, title, notes, date, time, day, ritual_types, worship_method, benefits, prayers, overall_note, special_day_name, departure_time, status, temple_id, created_date, updated_date
            FROM special_poojas
            ORDER BY id DESC;
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

  const _getSpecialPoojasById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, repeat_type, ritual_change, deity_selection, transport, deity_id, title, notes, date, time, day, ritual_types, worship_method, benefits, prayers, overall_note, special_day_name, departure_time, status, temple_id, created_date, updated_date
            FROM special_poojas
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Special Poojas not found" }, null);
          
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

  const _getSpecialPoojasByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, repeat_type, ritual_change, deity_selection, transport, deity_id, title, notes, date, time, day, ritual_types, worship_method, benefits, prayers, overall_note, special_day_name, departure_time, status, temple_id, created_date, updated_date
            FROM special_poojas
            WHERE temple_id = ?
          `;
          const [rows] = await client.query(query, [temple_id]);
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

  const _updateSpecialPoojas = async (jsonValue, callback) => {
    const { error, value } = specialPoojasSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    const finalTempleId = value.temple_id || value.templeId;
    const finalRitualTypes = value.ritual_types || value.ritualTypes || null;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM special_poojas WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Special Poojas not found" }, null);

          const updateQuery = `
            UPDATE special_poojas
            SET repeat_type = ?, ritual_change = ?, deity_selection = ?, transport = ?, deity_id = ?, title = ?, notes = ?, date = ?, time = ?, day = ?, ritual_types = ?, worship_method = ?, benefits = ?, prayers = ?, overall_note = ?, special_day_name = ?, departure_time = ?, status = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.repeat_type || null,
            value.ritual_change || null,
            value.deity_selection || null,
            value.transport || null,
            value.deity_id || null,
            value.title || null,
            value.notes || null,
            value.date ? new Date(value.date) : null,
            value.time || null,
            value.day || null,
            finalRitualTypes,
            value.worship_method || null,
            value.benefits || null,
            value.prayers || null,
            value.overall_note || null,
            value.special_day_name || null,
            value.departure_time || null,
            value.status || null,
            finalTempleId,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Special Poojas updated successfully" });
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

  const _deleteSpecialPoojas = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM special_poojas WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Special Poojas not found" }, null);

          const deleteQuery = `DELETE FROM special_poojas WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Special Poojas deleted successfully" });
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
    CreateSpecialPoojas: _createSpecialPoojas,
    GetSpecialPoojas: _getSpecialPoojas,
    GetSpecialPoojasById: _getSpecialPoojasById,
    GetSpecialPoojasByTempleId: _getSpecialPoojasByTempleId,
    UpdateSpecialPoojas: _updateSpecialPoojas,
    DeleteSpecialPoojas: _deleteSpecialPoojas,
  };
})();

module.exports = SpecialPoojasController;
