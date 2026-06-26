const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const kattaliSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().required(),
  designation: Joi.string().allow('', null).optional(),
  phone_number: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional()
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const KattaliController = (function () {
  
  const _createKattali = async (jsonValue, callback) => {
    const { error, value } = kattaliSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO kattali
          (name, designation, phone_number, status)
          VALUES
          (?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.name,
            value.designation || null,
            value.phone_number || null,
            value.status || 'active',
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Kattali created successfully",
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

  const _getKattali = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, name, designation, phone_number, status, created_date, updated_date
            FROM kattali
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

  const _getKattaliById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, name, designation, phone_number, status, created_date, updated_date
            FROM kattali
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Kattali not found" }, null);
          
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

  const _updateKattali = async (jsonValue, callback) => {
    const { error, value } = kattaliSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM kattali WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kattali not found" }, null);

          const updateQuery = `
            UPDATE kattali
            SET name = ?, designation = ?, phone_number = ?, status = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.name,
            value.designation || null,
            value.phone_number || null,
            value.status || null,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Kattali updated successfully" });
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

  const _deleteKattali = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM kattali WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kattali not found" }, null);

          const deleteQuery = `DELETE FROM kattali WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Kattali deleted successfully" });
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
    CreateKattali: _createKattali,
    GetKattali: _getKattali,
    GetKattaliById: _getKattaliById,
    UpdateKattali: _updateKattali,
    DeleteKattali: _deleteKattali,
  };
})();

module.exports = KattaliController;
