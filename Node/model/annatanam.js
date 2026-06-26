const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const annatanamSchema = Joi.object({
  id: Joi.number().integer().optional(),
  special_event: Joi.string().allow('', null).optional(),
  annadhanam_group: Joi.string().allow('', null).optional(),
  sponsor_name: Joi.string().allow('', null).optional(),
  benefits: Joi.string().allow('', null).optional(),
  count: Joi.number().integer().allow(null).optional(),
  amount: Joi.number().precision(2).allow(null).optional(),
  date: Joi.date().allow('', null).optional(),
  start_time: Joi.string().allow('', null).optional(),
  end_time: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional(),
  image_path: Joi.string().allow('', null).optional()
}).unknown();

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const AnnatanamController = (function () {
  
  const _createAnnatanam = async (jsonValue, callback) => {
    const { error, value } = annatanamSchema.validate(jsonValue);

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
          INSERT INTO annatanam
          (special_event, annadhanam_group, sponsor_name, benefits, count, amount, date, start_time, end_time, status, temple_id, image_path)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.special_event || null,
            value.annadhanam_group || null,
            value.sponsor_name || null,
            value.benefits || null,
            value.count || null,
            value.amount || null,
            value.date || null,
            value.start_time || null,
            value.end_time || null,
            value.status || 'active',
            finalTempleId,
            value.image_path || null,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Annatanam created successfully",
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

  const _getAnnatanam = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, special_event, annadhanam_group, sponsor_name, benefits, count, amount, date, start_time, end_time, status, temple_id, image_path, created_date, updated_date
            FROM annatanam
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

  const _getAnnatanamById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, special_event, annadhanam_group, sponsor_name, benefits, count, amount, date, start_time, end_time, status, temple_id, image_path, created_date, updated_date
            FROM annatanam
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Annatanam not found" }, null);
          
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

  const _getAnnatanamByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, special_event, annadhanam_group, sponsor_name, benefits, count, amount, date, start_time, end_time, status, temple_id, image_path, created_date, updated_date
            FROM annatanam
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

  const _updateAnnatanam = async (jsonValue, callback) => {
    const { error, value } = annatanamSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM annatanam WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Annatanam not found" }, null);

          const updateQuery = `
            UPDATE annatanam
            SET special_event = ?, annadhanam_group = ?, sponsor_name = ?, benefits = ?, count = ?, amount = ?, date = ?, start_time = ?, end_time = ?, status = ?, temple_id = ?, image_path = COALESCE(?, image_path)
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.special_event || null,
            value.annadhanam_group || null,
            value.sponsor_name || null,
            value.benefits || null,
            value.count || null,
            value.amount || null,
            value.date || null,
            value.start_time || null,
            value.end_time || null,
            value.status || null,
            finalTempleId,
            value.image_path || null,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Annatanam updated successfully" });
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

  const _deleteAnnatanam = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM annatanam WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Annatanam not found" }, null);

          const deleteQuery = `DELETE FROM annatanam WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Annatanam deleted successfully" });
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
    CreateAnnatanam: _createAnnatanam,
    GetAnnatanam: _getAnnatanam,
    GetAnnatanamById: _getAnnatanamById,
    GetAnnatanamByTempleId: _getAnnatanamByTempleId,
    UpdateAnnatanam: _updateAnnatanam,
    DeleteAnnatanam: _deleteAnnatanam,
  };
})();

module.exports = AnnatanamController;
