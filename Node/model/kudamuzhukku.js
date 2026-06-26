const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

const kudamuzhukkuSchema = Joi.object({
  active: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  annadhanam_time: Joi.string().pattern(timeRegex).allow('', null).optional(),
  chief_name: Joi.string().allow('', null).optional(),
  created_date: Joi.date().allow('', null).optional(),
  days_count: Joi.string().allow('', null).optional(),
  deeparadhana_time: Joi.string().pattern(timeRegex).allow('', null).optional(),
  end_date: Joi.date().allow('', null).optional(),
  extra_date: Joi.date().allow('', null).optional(),
  extra_day: Joi.string().allow('', null).optional(),
  extra_field1: Joi.string().allow('', null).optional(),
  extra_field2: Joi.string().allow('', null).optional(),
  kundam_count: Joi.string().allow('', null).optional(),
  mandala_pooja: Joi.string().allow('', null).optional(),
  period: Joi.string().allow('', null).optional(),
  start_date: Joi.date().allow('', null).optional(),
  temple_name: Joi.string().required(),
  time: Joi.string().pattern(timeRegex).allow('', null).optional(),
  type: Joi.string().allow('', null).optional(),
  yaga_period: Joi.string().allow('', null).optional(),
  yagasalai_name: Joi.string().allow('', null).optional(),
  yagasalai_pooja: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  yagasalai_time: Joi.string().pattern(timeRegex).allow('', null).optional(),
  id: Joi.number().integer().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const KudamuzhukkuController = (function () {
  
  const _createKudamuzhukku = async (jsonValue, callback) => {
    const { error, value } = kudamuzhukkuSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO kudamuzhukku
          (active, annadhanam_time, chief_name, created_date, days_count, deeparadhana_time, end_date, extra_date, extra_day, extra_field1, extra_field2, kundam_count, mandala_pooja, period, start_date, temple_name, time, type, yaga_period, yagasalai_name, yagasalai_pooja, yagasalai_time)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const activeVal = value.active !== undefined && value.active !== null ? (value.active ? 1 : 0) : null;
          const yagasalaiPoojaVal = value.yagasalai_pooja !== undefined && value.yagasalai_pooja !== null ? (value.yagasalai_pooja ? 1 : 0) : null;

          const [result] = await client.query(insertQuery, [
            activeVal,
            value.annadhanam_time || null,
            value.chief_name || null,
            value.created_date ? new Date(value.created_date) : new Date(),
            value.days_count || null,
            value.deeparadhana_time || null,
            value.end_date ? new Date(value.end_date) : null,
            value.extra_date ? new Date(value.extra_date) : null,
            value.extra_day || null,
            value.extra_field1 || null,
            value.extra_field2 || null,
            value.kundam_count || null,
            value.mandala_pooja || null,
            value.period || null,
            value.start_date ? new Date(value.start_date) : null,
            value.temple_name,
            value.time || null,
            value.type || null,
            value.yaga_period || null,
            value.yagasalai_name || null,
            yagasalaiPoojaVal,
            value.yagasalai_time || null
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Kudamuzhukku created successfully",
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

  const _getKudamuzhukkus = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(active AS UNSIGNED) as active, annadhanam_time, chief_name, created_date, days_count, deeparadhana_time, end_date, extra_date, extra_day, extra_field1, extra_field2, kundam_count, mandala_pooja, period, start_date, temple_name, time, type, yaga_period, yagasalai_name, CAST(yagasalai_pooja AS UNSIGNED) as yagasalai_pooja, yagasalai_time
            FROM kudamuzhukku
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

  const _getKudamuzhukkuById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(active AS UNSIGNED) as active, annadhanam_time, chief_name, created_date, days_count, deeparadhana_time, end_date, extra_date, extra_day, extra_field1, extra_field2, kundam_count, mandala_pooja, period, start_date, temple_name, time, type, yaga_period, yagasalai_name, CAST(yagasalai_pooja AS UNSIGNED) as yagasalai_pooja, yagasalai_time
            FROM kudamuzhukku
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Kudamuzhukku not found" }, null);
          
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

  const _updateKudamuzhukku = async (jsonValue, callback) => {
    const { error, value } = kudamuzhukkuSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM kudamuzhukku WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kudamuzhukku not found" }, null);

          const updateQuery = `
            UPDATE kudamuzhukku
            SET active = ?, annadhanam_time = ?, chief_name = ?, created_date = ?, days_count = ?, deeparadhana_time = ?, end_date = ?, extra_date = ?, extra_day = ?, extra_field1 = ?, extra_field2 = ?, kundam_count = ?, mandala_pooja = ?, period = ?, start_date = ?, temple_name = ?, time = ?, type = ?, yaga_period = ?, yagasalai_name = ?, yagasalai_pooja = ?, yagasalai_time = ?
            WHERE id = ?
          `;
          
          const activeVal = value.active !== undefined && value.active !== null ? (value.active ? 1 : 0) : null;
          const yagasalaiPoojaVal = value.yagasalai_pooja !== undefined && value.yagasalai_pooja !== null ? (value.yagasalai_pooja ? 1 : 0) : null;

          await client.query(updateQuery, [
            activeVal,
            value.annadhanam_time || null,
            value.chief_name || null,
            value.created_date ? new Date(value.created_date) : new Date(),
            value.days_count || null,
            value.deeparadhana_time || null,
            value.end_date ? new Date(value.end_date) : null,
            value.extra_date ? new Date(value.extra_date) : null,
            value.extra_day || null,
            value.extra_field1 || null,
            value.extra_field2 || null,
            value.kundam_count || null,
            value.mandala_pooja || null,
            value.period || null,
            value.start_date ? new Date(value.start_date) : null,
            value.temple_name,
            value.time || null,
            value.type || null,
            value.yaga_period || null,
            value.yagasalai_name || null,
            yagasalaiPoojaVal,
            value.yagasalai_time || null,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Kudamuzhukku updated successfully" });
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

  const _deleteKudamuzhukku = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM kudamuzhukku WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kudamuzhukku not found" }, null);

          const deleteQuery = `DELETE FROM kudamuzhukku WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Kudamuzhukku deleted successfully" });
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
    CreateKudamuzhukku: _createKudamuzhukku,
    GetKudamuzhukkus: _getKudamuzhukkus,
    GetKudamuzhukkuById: _getKudamuzhukkuById,
    UpdateKudamuzhukku: _updateKudamuzhukku,
    DeleteKudamuzhukku: _deleteKudamuzhukku,
  };
})();

module.exports = KudamuzhukkuController;
