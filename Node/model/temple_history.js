const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const templeHistorySchema = Joi.object({
  active: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  created_date: Joi.date().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  history_date: Joi.date().allow('', null).optional(),
  information: Joi.string().allow('', null).optional(),
  photo_path: Joi.string().allow('', null).optional(),
  temple_name: Joi.string().required(),
  text_part: Joi.string().allow('', null).optional(),
  title: Joi.string().required(),
  id: Joi.number().integer().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const TempleHistoryController = (function () {
  
  const _createTempleHistory = async (jsonValue, callback) => {
    const { error, value } = templeHistorySchema.validate(jsonValue);

    if (error) {
      console.error("Joi Validation Error (TempleHistory):", error.message);
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO temple_history
          (active, created_date, description, history_date, information, photo_path, temple_name, text_part, title)
          VALUES
          (?,?,?,?,?,?,?,?,?)
        `;

          const activeVal = value.active !== undefined && value.active !== null ? (value.active ? 1 : 0) : null;

          const [result] = await client.query(insertQuery, [
            activeVal,
            value.created_date ? new Date(value.created_date) : new Date(),
            value.description || null,
            value.history_date ? new Date(value.history_date) : null,
            value.information || null,
            value.photo_path || null,
            value.temple_name,
            value.text_part || null,
            value.title,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Temple history created successfully",
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

  const _getTempleHistories = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(active AS UNSIGNED) as active, created_date, description, history_date, information, photo_path, temple_name, text_part, title
            FROM temple_history
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

  const _getTempleHistoryById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(active AS UNSIGNED) as active, created_date, description, history_date, information, photo_path, temple_name, text_part, title
            FROM temple_history
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Temple history not found" }, null);
          
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

  const _updateTempleHistory = async (jsonValue, callback) => {
    const { error, value } = templeHistorySchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM temple_history WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Temple history not found" }, null);

          const updateQuery = `
            UPDATE temple_history
            SET active = ?, created_date = ?, description = ?, history_date = ?, information = ?, photo_path = ?, temple_name = ?, text_part = ?, title = ?
            WHERE id = ?
          `;
          
          const activeVal = value.active !== undefined && value.active !== null ? (value.active ? 1 : 0) : null;

          await client.query(updateQuery, [
            activeVal,
            value.created_date ? new Date(value.created_date) : new Date(),
            value.description || null,
            value.history_date ? new Date(value.history_date) : null,
            value.information || null,
            value.photo_path || null,
            value.temple_name,
            value.text_part || null,
            value.title,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Temple history updated successfully" });
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

  const _deleteTempleHistory = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM temple_history WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Temple history not found" }, null);

          const deleteQuery = `DELETE FROM temple_history WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Temple history deleted successfully" });
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
    CreateTempleHistory: _createTempleHistory,
    GetTempleHistories: _getTempleHistories,
    GetTempleHistoryById: _getTempleHistoryById,
    UpdateTempleHistory: _updateTempleHistory,
    DeleteTempleHistory: _deleteTempleHistory,
  };
})();

module.exports = TempleHistoryController;
