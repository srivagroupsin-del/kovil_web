const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

const thodarPoojaiSchema = Joi.object({
  day: Joi.string().allow('', null).optional(),
  deeparathanai_time: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  end_date: Joi.any().allow('', null).optional(),
  image_path: Joi.string().allow('', null).optional(),
  items: Joi.string().allow('', null).optional(),
  pooja_name: Joi.string().allow('', null).optional(),
  pooja_time: Joi.string().allow('', null).optional(),
  special_description: Joi.string().allow('', null).optional(),
  special_name: Joi.string().allow('', null).optional(),
  start_time: Joi.string().allow('', null).optional(),
  tamil_date: Joi.any().allow('', null).optional(),
  title: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(),
  id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional(),
}).unknown();

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const ThodarPoojaiController = (function () {
  
  const _createThodarPoojai = async (jsonValue, callback) => {
    const { error, value } = thodarPoojaiSchema.validate(jsonValue);

    if (error) {
      console.log("Thodar Poojai Validation Error (Create):", error.details);
      return callback({ result: result_failure, code: 400, message: error.message }, null);
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
          INSERT INTO thodar_poojai
          (day, deeparathanai_time, description, end_date, image_path, items, pooja_name, pooja_time, special_description, special_name, start_time, tamil_date, title, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.day || null,
            value.deeparathanai_time || null,
            value.description || null,
            (value.end_date && value.end_date !== '') ? new Date(value.end_date) : null,
            value.image_path || null,
            value.items || null,
            value.pooja_name || null,
            value.pooja_time || null,
            value.special_description || null,
            value.special_name || null,
            value.start_time || null,
            (value.tamil_date && value.tamil_date !== '') ? new Date(value.tamil_date) : null,
            value.title || null,
            finalTempleId,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Thodar Poojai created successfully",
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

  const _getThodarPoojai = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, day, deeparathanai_time, description, end_date, image_path, items, pooja_name, pooja_time, special_description, special_name, start_time, tamil_date, title, temple_id
            FROM thodar_poojai
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

  const _getThodarPoojaiById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, day, deeparathanai_time, description, end_date, image_path, items, pooja_name, pooja_time, special_description, special_name, start_time, tamil_date, title, temple_id
            FROM thodar_poojai
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Thodar Poojai not found" }, null);
          
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

  const _getThodarPoojaiByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, day, deeparathanai_time, description, end_date, image_path, items, pooja_name, pooja_time, special_description, special_name, start_time, tamil_date, title, temple_id
            FROM thodar_poojai
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

  const _updateThodarPoojai = async (jsonValue, callback) => {
    const { error, value } = thodarPoojaiSchema.validate(jsonValue);
    if (error) {
      console.log("Thodar Poojai Validation Error (Update):", error.details);
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM thodar_poojai WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Thodar Poojai not found" }, null);

          const updateQuery = `
            UPDATE thodar_poojai
            SET day = ?, deeparathanai_time = ?, description = ?, end_date = ?, image_path = COALESCE(?, image_path), items = ?, pooja_name = ?, pooja_time = ?, special_description = ?, special_name = ?, start_time = ?, tamil_date = ?, title = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.day || null,
            value.deeparathanai_time || null,
            value.description || null,
            (value.end_date && value.end_date !== '') ? new Date(value.end_date) : null,
            value.image_path || null,
            value.items || null,
            value.pooja_name || null,
            value.pooja_time || null,
            value.special_description || null,
            value.special_name || null,
            value.start_time || null,
            (value.tamil_date && value.tamil_date !== '') ? new Date(value.tamil_date) : null,
            value.title || null,
            finalTempleId,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Thodar Poojai updated successfully" });
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

  const _deleteThodarPoojai = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM thodar_poojai WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Thodar Poojai not found" }, null);

          const deleteQuery = `DELETE FROM thodar_poojai WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Thodar Poojai deleted successfully" });
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
    CreateThodarPoojai: _createThodarPoojai,
    GetThodarPoojai: _getThodarPoojai,
    GetThodarPoojaiById: _getThodarPoojaiById,
    GetThodarPoojaiByTempleId: _getThodarPoojaiByTempleId,
    UpdateThodarPoojai: _updateThodarPoojai,
    DeleteThodarPoojai: _deleteThodarPoojai,
  };
})();

module.exports = ThodarPoojaiController;
