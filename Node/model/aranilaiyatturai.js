const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const aranilaiyatturaiSchema = Joi.object({
  id: Joi.number().integer().optional(),
  general_member: Joi.string().allow('', null).optional(),
  executive_member_file: Joi.string().allow('', null).optional(),
  yagasalai_pooja: Joi.string().allow('', null).optional(),
  pooja_name: Joi.string().allow('', null).optional(),
  day: Joi.string().allow('', null).optional(),
  date: Joi.date().allow('', null).optional(),
  time: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional()
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const AranilaiyatturaiController = (function () {
  
  const _createAranilaiyatturai = async (jsonValue, callback) => {
    const { error, value } = aranilaiyatturaiSchema.validate(jsonValue);

    if (error || !value) {
      return callback({ result: result_failure, code: 400, message: error ? error.message : "Invalid request body" }, null);
    }

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO aranilaiyatturai
          (general_member, executive_member_file, yagasalai_pooja, pooja_name, day, date, time, status, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.general_member || null,
            value.executive_member_file || null,
            value.yagasalai_pooja || null,
            value.pooja_name || null,
            value.day || null,
            value.date || null,
            value.time || null,
            value.status || 'open',
            finalTempleId,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Aranilaiyatturai created successfully",
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

  const _getAranilaiyatturai = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, general_member, executive_member_file, yagasalai_pooja, pooja_name, day, date, time, status, temple_id, created_date, updated_date
            FROM aranilaiyatturai
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

  const _getAranilaiyatturaiById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, general_member, executive_member_file, yagasalai_pooja, pooja_name, day, date, time, status, temple_id, created_date, updated_date
            FROM aranilaiyatturai
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Aranilaiyatturai not found" }, null);
          
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

  const _getAranilaiyatturaiByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, general_member, executive_member_file, yagasalai_pooja, pooja_name, day, date, time, status, temple_id, created_date, updated_date
            FROM aranilaiyatturai
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

  const _updateAranilaiyatturai = async (jsonValue, callback) => {
    const { error, value } = aranilaiyatturaiSchema.validate(jsonValue);
    if (error || !value) return callback({ result: result_failure, code: 400, message: error ? error.message : "Invalid request body" }, null);

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM aranilaiyatturai WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Aranilaiyatturai not found" }, null);

          const updateQuery = `
            UPDATE aranilaiyatturai
            SET general_member = ?, executive_member_file = COALESCE(?, executive_member_file), yagasalai_pooja = ?, pooja_name = ?, day = ?, date = ?, time = ?, status = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.general_member || null,
            value.executive_member_file || null,
            value.yagasalai_pooja || null,
            value.pooja_name || null,
            value.day || null,
            value.date || null,
            value.time || null,
            value.status || null,
            finalTempleId,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Aranilaiyatturai updated successfully" });
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

  const _deleteAranilaiyatturai = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM aranilaiyatturai WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Aranilaiyatturai not found" }, null);

          const deleteQuery = `DELETE FROM aranilaiyatturai WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Aranilaiyatturai deleted successfully" });
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
    CreateAranilaiyatturai: _createAranilaiyatturai,
    GetAranilaiyatturai: _getAranilaiyatturai,
    GetAranilaiyatturaiById: _getAranilaiyatturaiById,
    GetAranilaiyatturaiByTempleId: _getAranilaiyatturaiByTempleId,
    UpdateAranilaiyatturai: _updateAranilaiyatturai,
    DeleteAranilaiyatturai: _deleteAranilaiyatturai,
  };
})();

module.exports = AranilaiyatturaiController;
