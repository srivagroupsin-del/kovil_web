const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const udanuraiSchema = Joi.object({
  balipitham: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  chariot_file: Joi.string().allow('', null).optional(),
  chariot_photo: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  created_date: Joi.date().allow('', null).optional(),
  deity_form: Joi.string().allow('', null).optional(),
  deity_name: Joi.string().allow('', null).optional(),
  divine_speciality: Joi.string().allow('', null).optional(),
  form_speciality: Joi.string().allow('', null).optional(),
  goddess_mother_name: Joi.string().allow('', null).optional(),
  goddess_name: Joi.string().allow('', null).optional(),
  goddess_photo: Joi.string().allow('', null).optional(),
  goddess_present_girl: Joi.string().allow('', null).optional(),
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
  worship_type: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().allow(null).optional(),
  id: Joi.number().integer().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const UdanuraiController = (function () {
  
  const _createUdanurai = async (jsonValue, callback) => {
    const { error, value } = udanuraiSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO udanurai
          (balipitham, chariot_file, chariot_photo, created_date, deity_form, deity_name, divine_speciality, form_speciality, goddess_mother_name, goddess_name, goddess_photo, goddess_present_girl, kodimaram, name, photo, preferred_flower, special_name, status, temple_tree, updated_date, utsavar_file, utsavar_photo, vehicle, vimana_level, worship_time, worship_type, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const convertBit = (val) => val !== undefined && val !== null ? (val ? 1 : 0) : null;

          const [result] = await client.query(insertQuery, [
            convertBit(value.balipitham),
            value.chariot_file || null,
            convertBit(value.chariot_photo),
            value.created_date ? new Date(value.created_date) : new Date(),
            value.deity_form || null,
            value.deity_name || null,
            value.divine_speciality || null,
            value.form_speciality || null,
            value.goddess_mother_name || null,
            value.goddess_name || null,
            value.goddess_photo || null,
            value.goddess_present_girl || null,
            convertBit(value.kodimaram),
            value.name || null,
            value.photo || null,
            value.preferred_flower || null,
            value.special_name || null,
            value.status,
            value.temple_tree || null,
            value.updated_date ? new Date(value.updated_date) : new Date(),
            value.utsavar_file || null,
            convertBit(value.utsavar_photo),
            value.vehicle || null,
            value.vimana_level || null,
            value.worship_time || null,
            value.worship_type || null,
            value.temple_id || null,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Udanurai created successfully",
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

  const _getUdanurais = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(balipitham AS UNSIGNED) as balipitham, chariot_file, CAST(chariot_photo AS UNSIGNED) as chariot_photo, created_date, deity_form, deity_name, divine_speciality, form_speciality, goddess_mother_name, goddess_name, goddess_photo, goddess_present_girl, CAST(kodimaram AS UNSIGNED) as kodimaram, name, photo, preferred_flower, special_name, status, temple_tree, updated_date, utsavar_file, CAST(utsavar_photo AS UNSIGNED) as utsavar_photo, vehicle, vimana_level, worship_time, worship_type, temple_id
            FROM udanurai
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

  const _getUdanuraiById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(balipitham AS UNSIGNED) as balipitham, chariot_file, CAST(chariot_photo AS UNSIGNED) as chariot_photo, created_date, deity_form, deity_name, divine_speciality, form_speciality, goddess_mother_name, goddess_name, goddess_photo, goddess_present_girl, CAST(kodimaram AS UNSIGNED) as kodimaram, name, photo, preferred_flower, special_name, status, temple_tree, updated_date, utsavar_file, CAST(utsavar_photo AS UNSIGNED) as utsavar_photo, vehicle, vimana_level, worship_time, worship_type, temple_id
            FROM udanurai
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Udanurai not found" }, null);
          
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

  const _getUdanuraiByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, CAST(balipitham AS UNSIGNED) as balipitham, chariot_file, CAST(chariot_photo AS UNSIGNED) as chariot_photo, created_date, deity_form, deity_name, divine_speciality, form_speciality, goddess_mother_name, goddess_name, goddess_photo, goddess_present_girl, CAST(kodimaram AS UNSIGNED) as kodimaram, name, photo, preferred_flower, special_name, status, temple_tree, updated_date, utsavar_file, CAST(utsavar_photo AS UNSIGNED) as utsavar_photo, vehicle, vimana_level, worship_time, worship_type, temple_id
            FROM udanurai
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

  const _updateUdanurai = async (jsonValue, callback) => {
    const { error, value } = udanuraiSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM udanurai WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Udanurai not found" }, null);

          const updateQuery = `
            UPDATE udanurai
            SET balipitham = ?, chariot_file = ?, chariot_photo = ?, created_date = ?, deity_form = ?, deity_name = ?, divine_speciality = ?, form_speciality = ?, goddess_mother_name = ?, goddess_name = ?, goddess_photo = ?, goddess_present_girl = ?, kodimaram = ?, name = ?, photo = ?, preferred_flower = ?, special_name = ?, status = ?, temple_tree = ?, updated_date = ?, utsavar_file = ?, utsavar_photo = ?, vehicle = ?, vimana_level = ?, worship_time = ?, worship_type = ?, temple_id = ?
            WHERE id = ?
          `;
          
          const convertBit = (val) => val !== undefined && val !== null ? (val ? 1 : 0) : null;

          await client.query(updateQuery, [
            convertBit(value.balipitham),
            value.chariot_file || null,
            convertBit(value.chariot_photo),
            value.created_date ? new Date(value.created_date) : new Date(),
            value.deity_form || null,
            value.deity_name || null,
            value.divine_speciality || null,
            value.form_speciality || null,
            value.goddess_mother_name || null,
            value.goddess_name || null,
            value.goddess_photo || null,
            value.goddess_present_girl || null,
            convertBit(value.kodimaram),
            value.name || null,
            value.photo || null,
            value.preferred_flower || null,
            value.special_name || null,
            value.status,
            value.temple_tree || null,
            value.updated_date ? new Date(value.updated_date) : new Date(),
            value.utsavar_file || null,
            convertBit(value.utsavar_photo),
            value.vehicle || null,
            value.vimana_level || null,
            value.worship_time || null,
            value.worship_type || null,
            value.temple_id || null,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Udanurai updated successfully" });
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

  const _deleteUdanurai = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM udanurai WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Udanurai not found" }, null);

          const deleteQuery = `DELETE FROM udanurai WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Udanurai deleted successfully" });
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
    CreateUdanurai: _createUdanurai,
    GetUdanurais: _getUdanurais,
    GetUdanuraiById: _getUdanuraiById,
    GetUdanuraiByTempleId: _getUdanuraiByTempleId,
    UpdateUdanurai: _updateUdanurai,
    DeleteUdanurai: _deleteUdanurai,
  };
})();

module.exports = UdanuraiController;
