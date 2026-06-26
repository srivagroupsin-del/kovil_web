const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const visucamNeramSchema = Joi.object({
  id: Joi.number().integer().optional(),
  day: Joi.string().allow('', null).optional(),
  description: Joi.string().max(1000).allow('', null).optional(),
  eng_date: Joi.any().allow('', null).optional(),
  image_path: Joi.string().allow('', null).optional(),
  pooja_name: Joi.string().allow('', null).optional(),
  pooja_time: Joi.string().allow('', null).optional(),
  poojai_title: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  tamil_date: Joi.any().allow('', null).optional(),
  viratagal: Joi.string().allow('', null).optional(),
  vishesha_name: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional()
}).unknown();

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const VisucamNeramController = (function () {
  
  const _createVisucamNeram = async (jsonValue, callback) => {
    const { error, value } = visucamNeramSchema.validate(jsonValue);

    if (error) {
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
          INSERT INTO visucam_neram
          (day, description, eng_date, image_path, pooja_name, pooja_time, poojai_title, status, tamil_date, viratagal, vishesha_name, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.day || null,
            value.description || null,
            (value.eng_date && value.eng_date !== '') ? new Date(value.eng_date) : null,
            value.image_path || null,
            value.pooja_name || null,
            value.pooja_time || null,
            value.poojai_title || null,
            value.status || null,
            (value.tamil_date && value.tamil_date !== '') ? new Date(value.tamil_date) : null,
            value.viratagal || null,
            value.vishesha_name || null,
            finalTempleId,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Visucam Neram created successfully",
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

  const _getVisucamNeram = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT * FROM visucam_neram ORDER BY id DESC;
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

  const _getVisucamNeramById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT * FROM visucam_neram WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Visucam Neram not found" }, null);
          
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

  const _getVisucamNeramByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT * FROM visucam_neram WHERE temple_id = ?
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

  const _updateVisucamNeram = async (jsonValue, callback) => {
    const { error, value } = visucamNeramSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM visucam_neram WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Visucam Neram not found" }, null);

          const updateQuery = `
            UPDATE visucam_neram
            SET day = ?, description = ?, eng_date = ?, image_path = COALESCE(?, image_path), pooja_name = ?, pooja_time = ?, poojai_title = ?, status = ?, tamil_date = ?, viratagal = ?, vishesha_name = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.day || null,
            value.description || null,
            (value.eng_date && value.eng_date !== '') ? new Date(value.eng_date) : null,
            value.image_path || null,
            value.pooja_name || null,
            value.pooja_time || null,
            value.poojai_title || null,
            value.status || null,
            (value.tamil_date && value.tamil_date !== '') ? new Date(value.tamil_date) : null,
            value.viratagal || null,
            value.vishesha_name || null,
            finalTempleId,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Visucam Neram updated successfully" });
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

  const _deleteVisucamNeram = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM visucam_neram WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Visucam Neram not found" }, null);

          const deleteQuery = `DELETE FROM visucam_neram WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Visucam Neram deleted successfully" });
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
    CreateVisucamNeram: _createVisucamNeram,
    GetVisucamNeram: _getVisucamNeram,
    GetVisucamNeramById: _getVisucamNeramById,
    GetVisucamNeramByTempleId: _getVisucamNeramByTempleId,
    UpdateVisucamNeram: _updateVisucamNeram,
    DeleteVisucamNeram: _deleteVisucamNeram,
  };
})();

module.exports = VisucamNeramController;
