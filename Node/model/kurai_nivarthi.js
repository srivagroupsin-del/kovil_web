const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const kuraiNivarthiSchema = Joi.object({
  pooja_type: Joi.string().allow('', null).optional(),
  ritual_change: Joi.string().allow('', null).optional(),
  deity_selection: Joi.string().allow('', null).optional(),
  deity_name: Joi.string().allow('', null).optional(),
  title: Joi.string().allow('', null).optional(),
  worship_method: Joi.string().allow('', null).optional(),
  vratham: Joi.string().allow('', null).optional(),
  prayer: Joi.string().allow('', null).optional(),
  benefits: Joi.string().allow('', null).optional(),
  nivarthi: Joi.string().allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  website_link: Joi.string().allow('', null).optional(),
  image_path: Joi.string().allow('', null).optional(),
  sub_title: Joi.string().allow('', null).optional(),
  sub_notes: Joi.string().allow('', null).optional(),
  sub_description: Joi.string().allow('', null).optional(),
  sub_category: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(),
  id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional(),
}).unknown();

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const KuraiNivarthiController = (function () {
  
  const _createKuraiNivarthi = async (jsonValue, callback) => {
    const { error, value } = kuraiNivarthiSchema.validate(jsonValue);

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
          INSERT INTO kurai_nivarthi
          (pooja_type, ritual_change, deity_selection, deity_name, title, worship_method, vratham, prayer, benefits, nivarthi, notes, description, website_link, image_path, sub_title, sub_notes, sub_description, sub_category, status, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.pooja_type || null,
            value.ritual_change || null,
            value.deity_selection || null,
            value.deity_name || null,
            value.title || null,
            value.worship_method || null,
            value.vratham || null,
            value.prayer || null,
            value.benefits || null,
            value.nivarthi || null,
            value.notes || null,
            value.description || null,
            value.website_link || null,
            value.image_path || null,
            value.sub_title || null,
            value.sub_notes || null,
            value.sub_description || null,
            value.sub_category || null,
            value.status || 'active',
            finalTempleId,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Kurai Nivarthi created successfully",
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

  const _getKuraiNivarthi = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, pooja_type, ritual_change, deity_selection, deity_name, title, worship_method, vratham, prayer, benefits, nivarthi, notes, description, website_link, image_path, sub_title, sub_notes, sub_description, sub_category, status, temple_id, created_date, updated_date
            FROM kurai_nivarthi
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

  const _getKuraiNivarthiById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, pooja_type, ritual_change, deity_selection, deity_name, title, worship_method, vratham, prayer, benefits, nivarthi, notes, description, website_link, image_path, sub_title, sub_notes, sub_description, sub_category, status, temple_id, created_date, updated_date
            FROM kurai_nivarthi
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Kurai Nivarthi not found" }, null);
          
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

  const _getKuraiNivarthiByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, pooja_type, ritual_change, deity_selection, deity_name, title, worship_method, vratham, prayer, benefits, nivarthi, notes, description, website_link, image_path, sub_title, sub_notes, sub_description, sub_category, status, temple_id, created_date, updated_date
            FROM kurai_nivarthi
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

  const _updateKuraiNivarthi = async (jsonValue, callback) => {
    const { error, value } = kuraiNivarthiSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM kurai_nivarthi WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kurai Nivarthi not found" }, null);

          const updateQuery = `
            UPDATE kurai_nivarthi
            SET pooja_type = ?, ritual_change = ?, deity_selection = ?, deity_name = ?, title = ?, worship_method = ?, vratham = ?, prayer = ?, benefits = ?, nivarthi = ?, notes = ?, description = ?, website_link = ?, image_path = COALESCE(?, image_path), sub_title = ?, sub_notes = ?, sub_description = ?, sub_category = ?, status = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.pooja_type || null,
            value.ritual_change || null,
            value.deity_selection || null,
            value.deity_name || null,
            value.title || null,
            value.worship_method || null,
            value.vratham || null,
            value.prayer || null,
            value.benefits || null,
            value.nivarthi || null,
            value.notes || null,
            value.description || null,
            value.website_link || null,
            value.image_path || null,
            value.sub_title || null,
            value.sub_notes || null,
            value.sub_description || null,
            value.sub_category || null,
            value.status || null,
            finalTempleId,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Kurai Nivarthi updated successfully" });
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

  const _deleteKuraiNivarthi = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM kurai_nivarthi WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kurai Nivarthi not found" }, null);

          const deleteQuery = `DELETE FROM kurai_nivarthi WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Kurai Nivarthi deleted successfully" });
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
    CreateKuraiNivarthi: _createKuraiNivarthi,
    GetKuraiNivarthi: _getKuraiNivarthi,
    GetKuraiNivarthiById: _getKuraiNivarthiById,
    GetKuraiNivarthiByTempleId: _getKuraiNivarthiByTempleId,
    UpdateKuraiNivarthi: _updateKuraiNivarthi,
    DeleteKuraiNivarthi: _deleteKuraiNivarthi,
  };
})();

module.exports = KuraiNivarthiController;
