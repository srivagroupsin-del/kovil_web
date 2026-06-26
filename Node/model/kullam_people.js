const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const kullamPeopleSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().required(),
  kullam: Joi.string().allow('', null).optional(),
  temple: Joi.string().allow('', null).optional(),
  phone: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional()
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const KullamPeopleController = (function () {
  
  const _createKullamPeople = async (jsonValue, callback) => {
    const { error, value } = kullamPeopleSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO kullam_people
          (name, kullam, temple, phone, address, status)
          VALUES
          (?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.name,
            value.kullam || null,
            value.temple || null,
            value.phone || null,
            value.address || null,
            value.status || 'active',
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Kullam People created successfully",
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

  const _getKullamPeople = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, name, kullam, temple, phone, address, status, created_date, updated_date
            FROM kullam_people
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

  const _getKullamPeopleById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, name, kullam, temple, phone, address, status, created_date, updated_date
            FROM kullam_people
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Kullam People not found" }, null);
          
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

  const _updateKullamPeople = async (jsonValue, callback) => {
    const { error, value } = kullamPeopleSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM kullam_people WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kullam People not found" }, null);

          const updateQuery = `
            UPDATE kullam_people
            SET name = ?, kullam = ?, temple = ?, phone = ?, address = ?, status = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.name,
            value.kullam || null,
            value.temple || null,
            value.phone || null,
            value.address || null,
            value.status || null,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Kullam People updated successfully" });
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

  const _deleteKullamPeople = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM kullam_people WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kullam People not found" }, null);

          const deleteQuery = `DELETE FROM kullam_people WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Kullam People deleted successfully" });
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
    CreateKullamPeople: _createKullamPeople,
    GetKullamPeople: _getKullamPeople,
    GetKullamPeopleById: _getKullamPeopleById,
    UpdateKullamPeople: _updateKullamPeople,
    DeleteKullamPeople: _deleteKullamPeople,
  };
})();

module.exports = KullamPeopleController;
