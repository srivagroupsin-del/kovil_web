const Joi = require("joi");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const communitySelectionSchema = Joi.object({
  id: Joi.number().integer().optional(),
  community_id: Joi.number().integer().required(),
  sub_community_id: Joi.number().integer().required(),
  kula_id: Joi.number().integer().required(),
  kula_deivam_id: Joi.number().integer().required(),
  vagaiyara_id: Joi.number().integer().required(),
  tharpothaiya_vagaiyara: Joi.string().allow('', null).optional(),
  generation_no: Joi.number().integer().allow(null).optional(),
  marital_status: Joi.string().valid('married', 'unmarried').default('unmarried'),
  spouse_name: Joi.string().allow('', null).optional(),
  spouse_kula_deivam_id: Joi.number().integer().allow(null).optional()
});

const CommunitySelectionsController = {
  CreateSelection: (params, callback) => {
    const { error, value } = communitySelectionSchema.validate(params);
    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
            INSERT INTO community_selections
            (community_id, sub_community_id, kula_id, kula_deivam_id, vagaiyara_id, tharpothaiya_vagaiyara, generation_no, marital_status, spouse_name, spouse_kula_deivam_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const [result] = await client.query(insertQuery, [
            value.community_id,
            value.sub_community_id,
            value.kula_id,
            value.kula_deivam_id,
            value.vagaiyara_id,
            value.tharpothaiya_vagaiyara || null,
            value.generation_no || null,
            value.marital_status || 'unmarried',
            value.spouse_name || null,
            value.spouse_kula_deivam_id || null
          ]);

          callback(null, { result: result_success, code: 200, message: "Selection created successfully", id: result.insertId });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  },

  UpdateSelection: (params, callback) => {
    const { error, value } = communitySelectionSchema.validate(params);
    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }
    if (!value.id) {
      return callback({ result: result_failure, code: 400, message: "ID is required for update" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const updateQuery = `
            UPDATE community_selections
            SET community_id = ?, sub_community_id = ?, kula_id = ?, kula_deivam_id = ?, vagaiyara_id = ?, tharpothaiya_vagaiyara = ?, generation_no = ?, marital_status = ?, spouse_name = ?, spouse_kula_deivam_id = ?
            WHERE id = ?
          `;
          await client.query(updateQuery, [
            value.community_id,
            value.sub_community_id,
            value.kula_id,
            value.kula_deivam_id,
            value.vagaiyara_id,
            value.tharpothaiya_vagaiyara || null,
            value.generation_no || null,
            value.marital_status || 'unmarried',
            value.spouse_name || null,
            value.spouse_kula_deivam_id || null,
            value.id
          ]);

          callback(null, { result: result_success, code: 200, message: "Selection updated successfully" });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  },

  GetSelections: (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);
        try {
          const [rows] = await client.query("SELECT * FROM community_selections ORDER BY id DESC");
          callback(null, { result: result_success, code: 200, data: rows });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  },

  GetSelectionById: (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);
        try {
          const [rows] = await client.query("SELECT * FROM community_selections WHERE id = ?", [id]);
          if (rows.length === 0) {
            return callback({ result: result_failure, code: 404, message: "Selection not found" }, null);
          }
          callback(null, { result: result_success, code: 200, data: rows[0] });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  },

  DeleteSelection: (params, callback) => {
    const id = params.id;
    if (!id) {
      return callback({ result: result_failure, code: 400, message: "ID is required for delete" }, null);
    }
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);
        try {
          await client.query("DELETE FROM community_selections WHERE id = ?", [id]);
          callback(null, { result: result_success, code: 200, message: "Selection deleted successfully" });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  }
};

module.exports = CommunitySelectionsController;
