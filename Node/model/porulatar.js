const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const porulatarSchema = Joi.object({
  id: Joi.number().integer().optional(),
  devotee_name: Joi.string().required(),
  item_name: Joi.string().allow('', null).optional(),
  items: Joi.array().items(Joi.string()).optional(),
  amount: Joi.number().precision(2).allow(null).optional(),
  date: Joi.date().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional()
}).unknown();

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const PorulatarController = (function () {
  
  const _createPorulatar = async (jsonValue, callback) => {
    const { error, value } = porulatarSchema.validate(jsonValue);

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
            INSERT INTO porulatar
            (devotee_name, amount, date, status, temple_id)
            VALUES
            (?,?,?,?,?)
          `;

          const [result] = await client.query(insertQuery, [
            value.devotee_name,
            value.amount || null,
            value.date || null,
            value.status || 'active',
            finalTempleId,
          ]);

          const porulatarId = result.insertId;

          // Resolve items to insert
          let itemsToInsert = [];
          if (value.items && Array.isArray(value.items)) {
            itemsToInsert = value.items.map(s => s.trim()).filter(Boolean);
          } else if (value.item_name) {
            itemsToInsert = value.item_name.split(',').map(s => s.trim()).filter(Boolean);
          }

          if (itemsToInsert.length > 0) {
            for (const item of itemsToInsert) {
              await client.query("INSERT INTO porulatar_items (porulatar_id, item_name) VALUES (?, ?)", [porulatarId, item]);
            }
          }

          callback(null, {
            result: result_success,
            code: 200,
            message: "Porulatar created successfully",
            data: { id: porulatarId },
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

  const _getPorulatar = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT p.id, p.devotee_name, p.amount, p.date, p.status, p.temple_id, p.created_date, p.updated_date,
                   GROUP_CONCAT(pi.item_name SEPARATOR ', ') as item_name
            FROM porulatar p
            LEFT JOIN porulatar_items pi ON p.id = pi.porulatar_id
            GROUP BY p.id
            ORDER BY p.id DESC;
          `;
          const [rows] = await client.query(query);
          for (const row of rows) {
            row.items = row.item_name ? row.item_name.split(', ').filter(Boolean) : [];
          }
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

  const _getPorulatarById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT p.id, p.devotee_name, p.amount, p.date, p.status, p.temple_id, p.created_date, p.updated_date,
                   GROUP_CONCAT(pi.item_name SEPARATOR ', ') as item_name
            FROM porulatar p
            LEFT JOIN porulatar_items pi ON p.id = pi.porulatar_id
            WHERE p.id = ?
            GROUP BY p.id
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Porulatar not found" }, null);
          
          const row = rows[0];
          row.items = row.item_name ? row.item_name.split(', ').filter(Boolean) : [];
          callback(null, { result: result_success, code: 200, data: row });
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

  const _getPorulatarByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT p.id, p.devotee_name, p.amount, p.date, p.status, p.temple_id, p.created_date, p.updated_date,
                   GROUP_CONCAT(pi.item_name SEPARATOR ', ') as item_name
            FROM porulatar p
            LEFT JOIN porulatar_items pi ON p.id = pi.porulatar_id
            WHERE p.temple_id = ?
            GROUP BY p.id
            ORDER BY p.id DESC
          `;
          const [rows] = await client.query(query, [temple_id]);
          for (const row of rows) {
            row.items = row.item_name ? row.item_name.split(', ').filter(Boolean) : [];
          }
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

  const _updatePorulatar = async (jsonValue, callback) => {
    const { error, value } = porulatarSchema.validate(jsonValue);
    if (error || !value) return callback({ result: result_failure, code: 400, message: error ? error.message : "Invalid request body" }, null);

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM porulatar WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Porulatar not found" }, null);

          const updateQuery = `
            UPDATE porulatar
            SET devotee_name = ?, amount = ?, date = ?, status = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.devotee_name,
            value.amount || null,
            value.date || null,
            value.status || null,
            finalTempleId,
            value.id,
          ]);

          // Resolve items
          let itemsToInsert = [];
          if (value.items && Array.isArray(value.items)) {
            itemsToInsert = value.items.map(s => s.trim()).filter(Boolean);
          } else if (value.item_name) {
            itemsToInsert = value.item_name.split(',').map(s => s.trim()).filter(Boolean);
          }

          // Delete existing items
          await client.query("DELETE FROM porulatar_items WHERE porulatar_id = ?", [value.id]);

          // Insert new ones
          if (itemsToInsert.length > 0) {
            for (const item of itemsToInsert) {
              await client.query("INSERT INTO porulatar_items (porulatar_id, item_name) VALUES (?, ?)", [value.id, item]);
            }
          }

          callback(null, { result: result_success, code: 200, message: "Porulatar updated successfully" });
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

  const _deletePorulatar = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error || !value) return callback({ result: result_failure, code: 400, message: error ? error.message : "Invalid request body" }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM porulatar WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Porulatar not found" }, null);

          const deleteQuery = `DELETE FROM porulatar WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Porulatar deleted successfully" });
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
    CreatePorulatar: _createPorulatar,
    GetPorulatar: _getPorulatar,
    GetPorulatarById: _getPorulatarById,
    GetPorulatarByTempleId: _getPorulatarByTempleId,
    UpdatePorulatar: _updatePorulatar,
    DeletePorulatar: _deletePorulatar,
  };
})();

module.exports = PorulatarController;
