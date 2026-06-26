const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const moolavarSchema = Joi.object({
  balipitham: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  chariot_file: Joi.string().allow('', null).optional(),
  chariot_photo: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  created_date: Joi.date().allow('', null).optional(),
  deity_form: Joi.string().allow('', null).optional(),
  deity_name: Joi.string().allow('', null).optional(),
  divine_speciality: Joi.string().allow('', null).optional(),
  form_speciality: Joi.string().allow('', null).optional(),
  kodimaram: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  name: Joi.string().allow('', null).optional(),
  photo: Joi.string().allow('', null).optional(),
  preferred_flower: Joi.string().allow('', null).optional(),
  special_name: Joi.string().allow('', null).optional(),
  status: Joi.string().required(),
  temple_tree: Joi.string().allow('', null).optional(),
  updated_date: Joi.date().allow('', null).optional(),
  utsavar_file: Joi.string().allow('', null).optional(),
  utsavar_photo: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  vehicle: Joi.string().allow('', null).optional(),
  vimana_level: Joi.string().allow('', null).optional(),
  worship_time: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().allow(null).optional(),
  existing_photos: Joi.string().allow('', null).optional(),
  id: Joi.number().integer().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const MoolavarController = (function () {
  const populateChildFields = async (client, moolavarId, row) => {
    const [specialRows] = await client.query("SELECT special_name FROM moolavar_special_names WHERE moolavar_id = ? ORDER BY id ASC", [moolavarId]);
    const [deityFormRows] = await client.query("SELECT deity_form FROM moolavar_deity_forms WHERE moolavar_id = ? ORDER BY id ASC", [moolavarId]);
    const [formSpecRows] = await client.query("SELECT form_speciality FROM moolavar_form_specialities WHERE moolavar_id = ? ORDER BY id ASC", [moolavarId]);
    const [photoRows] = await client.query("SELECT photo_path FROM moolavar_photos WHERE moolavar_id = ? ORDER BY id ASC", [moolavarId]);
    
    row.special_name = specialRows.map(r => r.special_name).join(', ') || null;
    row.deity_form = deityFormRows.map(r => r.deity_form).join(', ') || null;
    row.form_speciality = formSpecRows.map(r => r.form_speciality).join(', ') || null;
    row.photo = photoRows.map(r => r.photo_path).join(', ') || null;
  };

  const _createMoolavar = async (jsonValue, callback) => {
    const { error, value } = moolavarSchema.validate(jsonValue);

    if (error) {
      console.error("Joi Validation Error (Moolavar):", error.message);
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO moolavar
          (balipitham, chariot_file, chariot_photo, created_date, deity_name, divine_speciality, kodimaram, name, preferred_flower, status, temple_tree, updated_date, utsavar_file, utsavar_photo, vehicle, vimana_level, worship_time, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const convertBit = (val) => val !== undefined && val !== null ? (val ? 1 : 0) : null;

          const [result] = await client.query(insertQuery, [
            convertBit(value.balipitham),
            value.chariot_file || null,
            convertBit(value.chariot_photo),
            value.created_date ? new Date(value.created_date) : new Date(),
            value.deity_name || null,
            value.divine_speciality || null,
            convertBit(value.kodimaram),
            value.name || null,
            value.preferred_flower || null,
            value.status,
            value.temple_tree || null,
            value.updated_date ? new Date(value.updated_date) : new Date(),
            value.utsavar_file || null,
            convertBit(value.utsavar_photo),
            value.vehicle || null,
            value.vimana_level || null,
            value.worship_time || null,
            value.temple_id || null,
          ]);

          const moolavarId = result.insertId;

          // Insert into child tables
          if (value.photo) {
            const photos = value.photo.split(',').map(s => s.trim()).filter(Boolean);
            for (const p of photos) {
              await client.query("INSERT INTO moolavar_photos (moolavar_id, photo_path) VALUES (?, ?)", [moolavarId, p]);
            }
          }

          if (value.special_name) {
            const specialNames = value.special_name.split(',').map(s => s.trim()).filter(Boolean);
            for (const name of specialNames) {
              await client.query("INSERT INTO moolavar_special_names (moolavar_id, special_name) VALUES (?, ?)", [moolavarId, name]);
            }
          }

          if (value.deity_form) {
            const deityForms = value.deity_form.split(',').map(s => s.trim()).filter(Boolean);
            for (const form of deityForms) {
              await client.query("INSERT INTO moolavar_deity_forms (moolavar_id, deity_form) VALUES (?, ?)", [moolavarId, form]);
            }
          }

          if (value.form_speciality) {
            const formSpecs = value.form_speciality.split(',').map(s => s.trim()).filter(Boolean);
            for (const spec of formSpecs) {
              await client.query("INSERT INTO moolavar_form_specialities (moolavar_id, form_speciality) VALUES (?, ?)", [moolavarId, spec]);
            }
          }


          callback(null, {
            result: result_success,
            code: 200,
            message: "Moolavar created successfully",
            data: { id: moolavarId },
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

  const _getMoolavars = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(balipitham AS UNSIGNED) as balipitham, chariot_file, CAST(chariot_photo AS UNSIGNED) as chariot_photo, created_date, deity_name, divine_speciality, CAST(kodimaram AS UNSIGNED) as kodimaram, name, preferred_flower, status, temple_tree, updated_date, utsavar_file, CAST(utsavar_photo AS UNSIGNED) as utsavar_photo, vehicle, vimana_level, worship_time, temple_id
            FROM moolavar
            ORDER BY id DESC;
          `;
          const [rows] = await client.query(query);
          for (const row of rows) {
            await populateChildFields(client, row.id, row);
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

  const _getMoolavarById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(balipitham AS UNSIGNED) as balipitham, chariot_file, CAST(chariot_photo AS UNSIGNED) as chariot_photo, created_date, deity_name, divine_speciality, CAST(kodimaram AS UNSIGNED) as kodimaram, name, preferred_flower, status, temple_tree, updated_date, utsavar_file, CAST(utsavar_photo AS UNSIGNED) as utsavar_photo, vehicle, vimana_level, worship_time, temple_id
            FROM moolavar
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Moolavar not found" }, null);
          await populateChildFields(client, rows[0].id, rows[0]);
          
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

  const _getMoolavarByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(balipitham AS UNSIGNED) as balipitham, chariot_file, CAST(chariot_photo AS UNSIGNED) as chariot_photo, created_date, deity_name, divine_speciality, CAST(kodimaram AS UNSIGNED) as kodimaram, name, preferred_flower, status, temple_tree, updated_date, utsavar_file, CAST(utsavar_photo AS UNSIGNED) as utsavar_photo, vehicle, vimana_level, worship_time, temple_id
            FROM moolavar
            WHERE temple_id = ?
          `;
          const [rows] = await client.query(query, [temple_id]);
          for (const row of rows) {
            await populateChildFields(client, row.id, row);
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

  const _updateMoolavar = async (jsonValue, callback) => {
    const { error, value } = moolavarSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM moolavar WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Moolavar not found" }, null);

          const updateQuery = `
            UPDATE moolavar
            SET balipitham = ?, chariot_file = ?, chariot_photo = ?, created_date = ?, deity_name = ?, divine_speciality = ?, kodimaram = ?, name = ?, preferred_flower = ?, status = ?, temple_tree = ?, updated_date = ?, utsavar_file = ?, utsavar_photo = ?, vehicle = ?, vimana_level = ?, worship_time = ?, temple_id = ?
            WHERE id = ?
          `;
          
          const convertBit = (val) => val !== undefined && val !== null ? (val ? 1 : 0) : null;

          await client.query(updateQuery, [
            convertBit(value.balipitham),
            value.chariot_file || null,
            convertBit(value.chariot_photo),
            value.created_date ? new Date(value.created_date) : new Date(),
            value.deity_name || null,
            value.divine_speciality || null,
            convertBit(value.kodimaram),
            value.name || null,
            value.preferred_flower || null,
            value.status,
            value.temple_tree || null,
            value.updated_date ? new Date(value.updated_date) : new Date(),
            value.utsavar_file || null,
            convertBit(value.utsavar_photo),
            value.vehicle || null,
            value.vimana_level || null,
            value.worship_time || null,
            value.temple_id || null,
            value.id,
          ]);

          // Update child tables
          const moolavarId = value.id;
          await client.query("DELETE FROM moolavar_special_names WHERE moolavar_id = ?", [moolavarId]);
          await client.query("DELETE FROM moolavar_deity_forms WHERE moolavar_id = ?", [moolavarId]);
          await client.query("DELETE FROM moolavar_form_specialities WHERE moolavar_id = ?", [moolavarId]);
          await client.query("DELETE FROM moolavar_photos WHERE moolavar_id = ?", [moolavarId]);

          if (value.photo) {
            const photos = value.photo.split(',').map(s => s.trim()).filter(Boolean);
            for (const p of photos) {
              await client.query("INSERT INTO moolavar_photos (moolavar_id, photo_path) VALUES (?, ?)", [moolavarId, p]);
            }
          }

          if (value.special_name) {
            const specialNames = value.special_name.split(',').map(s => s.trim()).filter(Boolean);
            for (const name of specialNames) {
              await client.query("INSERT INTO moolavar_special_names (moolavar_id, special_name) VALUES (?, ?)", [moolavarId, name]);
            }
          }

          if (value.deity_form) {
            const deityForms = value.deity_form.split(',').map(s => s.trim()).filter(Boolean);
            for (const form of deityForms) {
              await client.query("INSERT INTO moolavar_deity_forms (moolavar_id, deity_form) VALUES (?, ?)", [moolavarId, form]);
            }
          }

          if (value.form_speciality) {
            const formSpecs = value.form_speciality.split(',').map(s => s.trim()).filter(Boolean);
            for (const spec of formSpecs) {
              await client.query("INSERT INTO moolavar_form_specialities (moolavar_id, form_speciality) VALUES (?, ?)", [moolavarId, spec]);
            }
          }

          callback(null, { result: result_success, code: 200, message: "Moolavar updated successfully" });
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

  const _deleteMoolavar = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM moolavar WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Moolavar not found" }, null);

          const deleteQuery = `DELETE FROM moolavar WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Moolavar deleted successfully" });
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
    CreateMoolavar: _createMoolavar,
    GetMoolavars: _getMoolavars,
    GetMoolavarById: _getMoolavarById,
    GetMoolavarByTempleId: _getMoolavarByTempleId,
    UpdateMoolavar: _updateMoolavar,
    DeleteMoolavar: _deleteMoolavar,
  };
})();

module.exports = MoolavarController;
