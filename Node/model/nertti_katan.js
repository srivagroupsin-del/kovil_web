const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const nerttiKatanSchema = Joi.object({
  id: Joi.number().integer().optional(),
  devotee_name: Joi.string().allow('', null).optional(),
  nerthi: Joi.string().allow('', null).optional(),
  offering: Joi.string().allow('', null).optional(),
  amount: Joi.number().precision(2).allow(null).optional(),
  image_path: Joi.string().allow('', null).optional(),
  date: Joi.date().allow('', null).optional(),
  thiruvilakku_pooja: Joi.string().allow('', null).optional(),
  new_account_pooja: Joi.string().allow('', null).optional(),
  vehicle_pooja: Joi.string().allow('', null).optional(),
  chakra_vehicle_pooja: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional()
}).unknown();

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const NerttiKatanController = (function () {
  
  const _createNerttiKatan = async (jsonValue, callback) => {
    const { error, value } = nerttiKatanSchema.validate(jsonValue);

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
          INSERT INTO nertti_katan
          (devotee_name, nerthi, offering, amount, image_path, date, thiruvilakku_pooja, new_account_pooja, vehicle_pooja, chakra_vehicle_pooja, status, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.devotee_name || null,
            value.nerthi || null,
            value.offering || null,
            value.amount || null,
            value.image_path || null,
            value.date || null,
            value.thiruvilakku_pooja || null,
            value.new_account_pooja || null,
            value.vehicle_pooja || null,
            value.chakra_vehicle_pooja || null,
            value.status || 'active',
            finalTempleId,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Nertti Katan created successfully",
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

  const _getNerttiKatan = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, devotee_name, nerthi, offering, amount, image_path, date, thiruvilakku_pooja, new_account_pooja, vehicle_pooja, chakra_vehicle_pooja, status, temple_id, created_date, updated_date
            FROM nertti_katan
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

  const _getNerttiKatanById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, devotee_name, nerthi, offering, amount, image_path, date, thiruvilakku_pooja, new_account_pooja, vehicle_pooja, chakra_vehicle_pooja, status, temple_id, created_date, updated_date
            FROM nertti_katan
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Nertti Katan not found" }, null);
          
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

  const _getNerttiKatanByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, devotee_name, nerthi, offering, amount, image_path, date, thiruvilakku_pooja, new_account_pooja, vehicle_pooja, chakra_vehicle_pooja, status, temple_id, created_date, updated_date
            FROM nertti_katan
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

  const _updateNerttiKatan = async (jsonValue, callback) => {
    const { error, value } = nerttiKatanSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM nertti_katan WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Nertti Katan not found" }, null);

          const updateQuery = `
            UPDATE nertti_katan
            SET devotee_name = ?, nerthi = ?, offering = ?, amount = ?, image_path = COALESCE(?, image_path), date = ?, thiruvilakku_pooja = ?, new_account_pooja = ?, vehicle_pooja = ?, chakra_vehicle_pooja = ?, status = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.devotee_name || null,
            value.nerthi || null,
            value.offering || null,
            value.amount || null,
            value.image_path || null,
            value.date && value.date !== '' ? value.date : null,
            value.thiruvilakku_pooja || null,
            value.new_account_pooja || null,
            value.vehicle_pooja || null,
            value.chakra_vehicle_pooja || null,
            value.status || null,
            finalTempleId,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Nertti Katan updated successfully" });
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

  const _deleteNerttiKatan = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM nertti_katan WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Nertti Katan not found" }, null);

          const deleteQuery = `DELETE FROM nertti_katan WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Nertti Katan deleted successfully" });
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
    CreateNerttiKatan: _createNerttiKatan,
    GetNerttiKatan: _getNerttiKatan,
    GetNerttiKatanById: _getNerttiKatanById,
    GetNerttiKatanByTempleId: _getNerttiKatanByTempleId,
    UpdateNerttiKatan: _updateNerttiKatan,
    DeleteNerttiKatan: _deleteNerttiKatan,
  };
})();

module.exports = NerttiKatanController;
