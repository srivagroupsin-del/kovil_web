const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const templeDetailSchema = Joi.object({
  active: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).required(),
  characteristics: Joi.string().allow('', null).optional(),
  created_date: Joi.date().allow('', null).optional(),
  heritage: Joi.string().allow('', null).optional(),
  history: Joi.string().allow('', null).optional(),
  mandapams: Joi.string().allow('', null).optional(),
  miracles: Joi.string().allow('', null).optional(),
  other_names: Joi.string().allow('', null).optional(),
  rajagopuram_direction: Joi.string().allow('', null).optional(),
  sanctum_structure: Joi.string().allow('', null).optional(),
  song_note: Joi.string().allow('', null).optional(),
  song_place: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).required(),
  special_features: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  temple_structure: Joi.string().allow('', null).optional(),
  temple_basic_id: Joi.number().integer().required(),
  padal_padiyavar: Joi.string().allow('', null).optional(),
  entha_pathi: Joi.string().allow('', null).optional(),
  worship_type: Joi.string().allow('', null).optional(),
  community_id: Joi.number().integer().allow('', null).optional(),
  sub_community_id: Joi.number().integer().allow('', null).optional(),
  kula_id: Joi.number().integer().allow('', null).optional(),
  kula_deivam_id: Joi.number().integer().allow('', null).optional(),
  vagaiyara_id: Joi.number().integer().allow('', null).optional(),
  tharpothaiya_vagaiyara: Joi.string().allow('', null).optional(),
  generation_no: Joi.number().integer().allow('', null).optional(),
  marital_status: Joi.string().valid('married', 'unmarried').allow('', null).optional(),
  spouse_name: Joi.string().allow('', null).optional(),
  spouse_kula_deivam_id: Joi.number().integer().allow('', null).optional(),
  id: Joi.number().integer().optional(),
  theivankal: Joi.alternatives().try(
    Joi.array().items(
      Joi.object({
        deivam: Joi.string().required(),
        thesai: Joi.string().required(),
        photo: Joi.string().allow('', null).optional(),
      })
    ),
    Joi.string().allow('', null)
  ).optional().allow(null),
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const TempleDetailsController = (function () {
  
  const populateChildFields = async (client, templeDetailsId, row) => {
    const [mandapamRows] = await client.query("SELECT mandapam_name FROM temple_mandapams WHERE temple_details_id = ? ORDER BY id ASC", [templeDetailsId]);
    const [otherNameRows] = await client.query("SELECT other_name FROM temple_other_names WHERE temple_details_id = ? ORDER BY id ASC", [templeDetailsId]);
    const [theivankalRows] = await client.query("SELECT deivam, thesai, photo FROM temple_theivankal WHERE temple_details_id = ? ORDER BY id ASC", [templeDetailsId]);
    row.mandapams = mandapamRows.map(r => r.mandapam_name).join(', ') || null;
    row.other_names = otherNameRows.map(r => r.other_name).join(', ') || null;
    row.theivankal = theivankalRows.map(r => ({ deivam: r.deivam, thesai: r.thesai, photo: r.photo }));
  };

  const _createTempleDetail = async (jsonValue, callback) => {
    const { error, value } = templeDetailSchema.validate(jsonValue);

    if (error) {
      return callback(
        { result: result_failure, code: 400, message: error.message },
        null,
      );
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            { result: result_failure, code: 500, message: "Database connection error" },
            null,
          );
        }

        try {
          const insertQuery = `
          INSERT INTO temple_details
          (active, characteristics, created_date, heritage, history, miracles, rajagopuram_direction, sanctum_structure, song_note, song_place, special_features, status, temple_structure, temple_basic_id, padal_padiyavar, entha_pathi, worship_type, community_id, sub_community_id, kula_id, kula_deivam_id, vagaiyara_id, tharpothaiya_vagaiyara, generation_no, marital_status, spouse_name, spouse_kula_deivam_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.active ? 1 : 0,
            value.characteristics || null,
            value.created_date ? new Date(value.created_date) : new Date(),
            value.heritage || null,
            value.history || null,
            value.miracles || null,
            value.rajagopuram_direction || null,
            value.sanctum_structure || null,
            value.song_note || null,
            value.song_place ? 1 : 0,
            value.special_features || null,
            value.status || null,
            value.temple_structure || null,
            value.temple_basic_id,
            value.padal_padiyavar || null,
            value.entha_pathi || null,
            value.worship_type || null,
            value.community_id ? parseInt(value.community_id, 10) : null,
            value.sub_community_id ? parseInt(value.sub_community_id, 10) : null,
            value.kula_id ? parseInt(value.kula_id, 10) : null,
            value.kula_deivam_id ? parseInt(value.kula_deivam_id, 10) : null,
            value.vagaiyara_id ? parseInt(value.vagaiyara_id, 10) : null,
            value.tharpothaiya_vagaiyara || null,
            value.generation_no ? parseInt(value.generation_no, 10) : null,
            value.marital_status || 'unmarried',
            value.spouse_name || null,
            value.spouse_kula_deivam_id ? parseInt(value.spouse_kula_deivam_id, 10) : null,
          ]);

          const templeDetailsId = result.insertId;

          if (value.mandapams) {
            const mandapams = value.mandapams.split(',').map(m => m.trim()).filter(Boolean);
            for (const m of mandapams) {
              await client.query("INSERT INTO temple_mandapams (temple_details_id, mandapam_name) VALUES (?, ?)", [templeDetailsId, m]);
            }
          }

          if (value.other_names) {
            const otherNames = value.other_names.split(',').map(n => n.trim()).filter(Boolean);
            for (const n of otherNames) {
              await client.query("INSERT INTO temple_other_names (temple_details_id, other_name) VALUES (?, ?)", [templeDetailsId, n]);
            }
          }

          let theivankalArr = value.theivankal;
          if (typeof theivankalArr === 'string') {
            try {
              theivankalArr = JSON.parse(theivankalArr);
            } catch (e) {
              theivankalArr = [];
            }
          }
          if (theivankalArr && Array.isArray(theivankalArr)) {
            for (const t of theivankalArr) {
              if (t.deivam && t.thesai) {
                await client.query("INSERT INTO temple_theivankal (temple_details_id, deivam, thesai, photo) VALUES (?, ?, ?, ?)", [templeDetailsId, t.deivam, t.thesai, t.photo || null]);
              }
            }
          }

          callback(null, {
            result: result_success,
            code: 200,
            message: "Temple detail created successfully",
            data: { id: templeDetailsId },
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _getTempleDetails = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            { result: result_failure, code: 500, message: "Database connection error" },
            null,
          );
        }

        try {
          const query = `
            SELECT id, CAST(active AS UNSIGNED) as active, characteristics, created_date, heritage, history, miracles, rajagopuram_direction, sanctum_structure, song_note, CAST(song_place AS UNSIGNED) as song_place, special_features, status, temple_structure, temple_basic_id, padal_padiyavar, entha_pathi, worship_type, community_id, sub_community_id, kula_id, kula_deivam_id, vagaiyara_id, tharpothaiya_vagaiyara, generation_no, marital_status, spouse_name, spouse_kula_deivam_id
            FROM temple_details
            ORDER BY id DESC;
          `;
          const [rows] = await client.query(query);
          for (const row of rows) {
            await populateChildFields(client, row.id, row);
          }
          callback(null, {
            result: result_success,
            code: 200,
            data: rows,
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _getTempleDetailById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            { result: result_failure, code: 500, message: "Database connection error" },
            null,
          );
        }

        try {
          const query = `
            SELECT id, CAST(active AS UNSIGNED) as active, characteristics, created_date, heritage, history, miracles, rajagopuram_direction, sanctum_structure, song_note, CAST(song_place AS UNSIGNED) as song_place, special_features, status, temple_structure, temple_basic_id, padal_padiyavar, entha_pathi, worship_type, community_id, sub_community_id, kula_id, kula_deivam_id, vagaiyara_id, tharpothaiya_vagaiyara, generation_no, marital_status, spouse_name, spouse_kula_deivam_id
            FROM temple_details
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) {
            return callback(
              { result: result_failure, code: 404, message: "Temple detail not found" },
              null,
            );
          }
          await populateChildFields(client, rows[0].id, rows[0]);
          callback(null, {
            result: result_success,
            code: 200,
            data: rows[0],
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _getTempleDetailByBasicId = async (temple_basic_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            { result: result_failure, code: 500, message: "Database connection error" },
            null,
          );
        }

        try {
          const query = `
            SELECT id, CAST(active AS UNSIGNED) as active, characteristics, created_date, heritage, history, miracles, rajagopuram_direction, sanctum_structure, song_note, CAST(song_place AS UNSIGNED) as song_place, special_features, status, temple_structure, temple_basic_id, padal_padiyavar, entha_pathi, worship_type, community_id, sub_community_id, kula_id, kula_deivam_id, vagaiyara_id, tharpothaiya_vagaiyara, generation_no, marital_status, spouse_name, spouse_kula_deivam_id
            FROM temple_details
            WHERE temple_basic_id = ?
          `;
          const [rows] = await client.query(query, [temple_basic_id]);
          for (const row of rows) {
            await populateChildFields(client, row.id, row);
          }
          callback(null, {
            result: result_success,
            code: 200,
            data: rows,
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _updateTempleDetail = async (jsonValue, callback) => {
    const { error, value } = templeDetailSchema.validate(jsonValue);
    if (error) {
      return callback(
        { result: result_failure, code: 400, message: error.message },
        null,
      );
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            { result: result_failure, code: 500, message: "Database connection error" },
            null,
          );
        }

        try {
          const checkQuery = `SELECT id FROM temple_details WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) {
            return callback(
              { result: result_failure, code: 404, message: "Temple detail not found" },
              null,
            );
          }

          const updateQuery = `
            UPDATE temple_details
            SET active = ?, characteristics = ?, created_date = ?, heritage = ?, history = ?, miracles = ?, rajagopuram_direction = ?, sanctum_structure = ?, song_note = ?, song_place = ?, special_features = ?, status = ?, temple_structure = ?, temple_basic_id = ?, padal_padiyavar = ?, entha_pathi = ?, worship_type = ?, community_id = ?, sub_community_id = ?, kula_id = ?, kula_deivam_id = ?, vagaiyara_id = ?, tharpothaiya_vagaiyara = ?, generation_no = ?, marital_status = ?, spouse_name = ?, spouse_kula_deivam_id = ?
            WHERE id = ?
          `;
          await client.query(updateQuery, [
            value.active ? 1 : 0,
            value.characteristics || null,
            value.created_date ? new Date(value.created_date) : new Date(),
            value.heritage || null,
            value.history || null,
            value.miracles || null,
            value.rajagopuram_direction || null,
            value.sanctum_structure || null,
            value.song_note || null,
            value.song_place ? 1 : 0,
            value.special_features || null,
            value.status || null,
            value.temple_structure || null,
            value.temple_basic_id,
            value.padal_padiyavar || null,
            value.entha_pathi || null,
            value.worship_type || null,
            value.community_id ? parseInt(value.community_id, 10) : null,
            value.sub_community_id ? parseInt(value.sub_community_id, 10) : null,
            value.kula_id ? parseInt(value.kula_id, 10) : null,
            value.kula_deivam_id ? parseInt(value.kula_deivam_id, 10) : null,
            value.vagaiyara_id ? parseInt(value.vagaiyara_id, 10) : null,
            value.tharpothaiya_vagaiyara || null,
            value.generation_no ? parseInt(value.generation_no, 10) : null,
            value.marital_status || 'unmarried',
            value.spouse_name || null,
            value.spouse_kula_deivam_id ? parseInt(value.spouse_kula_deivam_id, 10) : null,
            value.id,
          ]);

          const templeDetailsId = value.id;
          await client.query("DELETE FROM temple_mandapams WHERE temple_details_id = ?", [templeDetailsId]);
          await client.query("DELETE FROM temple_other_names WHERE temple_details_id = ?", [templeDetailsId]);
          await client.query("DELETE FROM temple_theivankal WHERE temple_details_id = ?", [templeDetailsId]);

          if (value.mandapams) {
            const mandapams = value.mandapams.split(',').map(m => m.trim()).filter(Boolean);
            for (const m of mandapams) {
              await client.query("INSERT INTO temple_mandapams (temple_details_id, mandapam_name) VALUES (?, ?)", [templeDetailsId, m]);
            }
          }

          if (value.other_names) {
            const otherNames = value.other_names.split(',').map(n => n.trim()).filter(Boolean);
            for (const n of otherNames) {
              await client.query("INSERT INTO temple_other_names (temple_details_id, other_name) VALUES (?, ?)", [templeDetailsId, n]);
            }
          }

          let theivankalArr = value.theivankal;
          if (typeof theivankalArr === 'string') {
            try {
              theivankalArr = JSON.parse(theivankalArr);
            } catch (e) {
              theivankalArr = [];
            }
          }
          if (theivankalArr && Array.isArray(theivankalArr)) {
            for (const t of theivankalArr) {
              if (t.deivam && t.thesai) {
                await client.query("INSERT INTO temple_theivankal (temple_details_id, deivam, thesai, photo) VALUES (?, ?, ?, ?)", [templeDetailsId, t.deivam, t.thesai, t.photo || null]);
              }
            }
          }

          callback(null, {
            result: result_success,
            code: 200,
            message: "Temple detail updated successfully",
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _deleteTempleDetail = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) {
      return callback(
        { result: result_failure, code: 400, message: error.message },
        null,
      );
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            { result: result_failure, code: 500, message: "Database connection error" },
            null,
          );
        }

        try {
          const checkQuery = `SELECT id FROM temple_details WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) {
            return callback(
              { result: result_failure, code: 404, message: "Temple detail not found" },
              null,
            );
          }

          const deleteQuery = `DELETE FROM temple_details WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Temple detail deleted successfully",
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  return {
    CreateTempleDetail: _createTempleDetail,
    GetTempleDetails: _getTempleDetails,
    GetTempleDetailById: _getTempleDetailById,
    GetTempleDetailByBasicId: _getTempleDetailByBasicId,
    UpdateTempleDetail: _updateTempleDetail,
    DeleteTempleDetail: _deleteTempleDetail,
  };
})();

module.exports = TempleDetailsController;
