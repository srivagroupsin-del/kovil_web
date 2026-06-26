const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

const nityaPoojasSchema = Joi.object({
  abhishekam: Joi.string().allow('', null).optional(),
  alangaram: Joi.string().allow('', null).optional(),
  aradhanai: Joi.string().allow('', null).optional(),
  created_date: Joi.date().allow('', null).optional(),
  day: Joi.string().allow('', null).optional(),
  deity_type: Joi.string().allow('', null).optional(),
  details: Joi.string().allow('', null).optional(),
  extra_alangaram: Joi.string().allow('', null).optional(),
  extra_sandanam: Joi.string().allow('', null).optional(),
  maha_deep_aradhanai: Joi.string().allow('', null).optional(),
  naivedyam: Joi.string().allow('', null).optional(),
  parayanam: Joi.string().allow('', null).optional(),
  pooja_name: Joi.string().required(),
  pooja_notes: Joi.string().allow('', null).optional(),
  pooja_time: Joi.string().allow('', null).optional(),
  pooja_type: Joi.string().allow('', null).optional(),
  pooja_vagai: Joi.string().allow('', null).optional(),
  session: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  theertham: Joi.string().allow('', null).optional(),
  time: Joi.string().pattern(timeRegex).allow('', null).optional(),
  updated_date: Joi.date().allow('', null).optional(),
  temple_id: Joi.number().integer().required(),
  id: Joi.number().integer().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const NityaPoojasController = (function () {
  
  const _createNityaPoojas = async (jsonValue, callback) => {
    const { error, value } = nityaPoojasSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO nitya_poojas
          (abhishekam, alangaram, aradhanai, created_date, day, deity_type, details, extra_alangaram, extra_sandanam, maha_deep_aradhanai, naivedyam, parayanam, pooja_name, pooja_notes, pooja_time, pooja_type, pooja_vagai, session, status, theertham, time, updated_date, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.abhishekam || null,
            value.alangaram || null,
            value.aradhanai || null,
            value.created_date ? new Date(value.created_date) : new Date(),
            value.day || null,
            value.deity_type || null,
            value.details || null,
            value.extra_alangaram || null,
            value.extra_sandanam || null,
            value.maha_deep_aradhanai || null,
            value.naivedyam || null,
            value.parayanam || null,
            value.pooja_name,
            value.pooja_notes || null,
            value.pooja_time || null,
            value.pooja_type || null,
            value.pooja_vagai || null,
            value.session || null,
            value.status || null,
            value.theertham || null,
            value.time || null,
            value.updated_date ? new Date(value.updated_date) : new Date(),
            value.temple_id,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Nitya Poojas created successfully",
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

  const _getNityaPoojas = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, abhishekam, alangaram, aradhanai, created_date, day, deity_type, details, extra_alangaram, extra_sandanam, maha_deep_aradhanai, naivedyam, parayanam, pooja_name, pooja_notes, pooja_time, pooja_type, pooja_vagai, session, status, theertham, time, updated_date, temple_id
            FROM nitya_poojas
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

  const _getNityaPoojasById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, abhishekam, alangaram, aradhanai, created_date, day, deity_type, details, extra_alangaram, extra_sandanam, maha_deep_aradhanai, naivedyam, parayanam, pooja_name, pooja_notes, pooja_time, pooja_type, pooja_vagai, session, status, theertham, time, updated_date, temple_id
            FROM nitya_poojas
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Nitya Poojas not found" }, null);
          
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

  const _getNityaPoojasByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, abhishekam, alangaram, aradhanai, created_date, day, deity_type, details, extra_alangaram, extra_sandanam, maha_deep_aradhanai, naivedyam, parayanam, pooja_name, pooja_notes, pooja_time, pooja_type, pooja_vagai, session, status, theertham, time, updated_date, temple_id
            FROM nitya_poojas
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

  const _updateNityaPoojas = async (jsonValue, callback) => {
    const { error, value } = nityaPoojasSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM nitya_poojas WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Nitya Poojas not found" }, null);

          const updateQuery = `
            UPDATE nitya_poojas
            SET abhishekam = ?, alangaram = ?, aradhanai = ?, created_date = ?, day = ?, deity_type = ?, details = ?, extra_alangaram = ?, extra_sandanam = ?, maha_deep_aradhanai = ?, naivedyam = ?, parayanam = ?, pooja_name = ?, pooja_notes = ?, pooja_time = ?, pooja_type = ?, pooja_vagai = ?, session = ?, status = ?, theertham = ?, time = ?, updated_date = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.abhishekam || null,
            value.alangaram || null,
            value.aradhanai || null,
            value.created_date ? new Date(value.created_date) : new Date(),
            value.day || null,
            value.deity_type || null,
            value.details || null,
            value.extra_alangaram || null,
            value.extra_sandanam || null,
            value.maha_deep_aradhanai || null,
            value.naivedyam || null,
            value.parayanam || null,
            value.pooja_name,
            value.pooja_notes || null,
            value.pooja_time || null,
            value.pooja_type || null,
            value.pooja_vagai || null,
            value.session || null,
            value.status || null,
            value.theertham || null,
            value.time || null,
            value.updated_date ? new Date(value.updated_date) : new Date(),
            value.temple_id,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Nitya Poojas updated successfully" });
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

  const _deleteNityaPoojas = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM nitya_poojas WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Nitya Poojas not found" }, null);

          const deleteQuery = `DELETE FROM nitya_poojas WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Nitya Poojas deleted successfully" });
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
    CreateNityaPoojas: _createNityaPoojas,
    GetNityaPoojas: _getNityaPoojas,
    GetNityaPoojasById: _getNityaPoojasById,
    GetNityaPoojasByTempleId: _getNityaPoojasByTempleId,
    UpdateNityaPoojas: _updateNityaPoojas,
    DeleteNityaPoojas: _deleteNityaPoojas,
  };
})();

module.exports = NityaPoojasController;
