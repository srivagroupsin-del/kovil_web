const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const kullamPeopleSchema = Joi.object({
  id: Joi.number().integer().optional(),
  status: Joi.string().allow('', null).optional(),
  vagaiyara: Joi.alternatives().try(Joi.number().integer(), Joi.string()).allow('', null).optional(),
  entha_uru: Joi.string().allow('', null).optional(),
  district: Joi.string().allow('', null).optional(),
  pincode: Joi.string().allow('', null).optional(),
  vagaiyara_nickname: Joi.string().allow('', null).optional(),
  family_type: Joi.string().allow('', null).optional(),
  parent_family_id: Joi.number().allow('', null).optional(),
  family_members: Joi.array().allow(null).optional(),
  eerapu_members: Joi.array().items(Joi.object({
    id: Joi.number().integer().optional(),
    name: Joi.string().required(),
    kula_deivam_id: Joi.number().integer().allow(null).optional(),
    generation_no: Joi.string().allow(null, '').optional(),
    status: Joi.string().allow(null, '').optional()
  })).allow(null).optional(),
}).unknown(true);

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
          let vagaiyaraId = null;
          let vagaiyaraName = null;
          let communityId = null;
          let subCommunityId = null;
          let kulamId = null;
          let kulaDeivamId = null;

          const vagaiyaraVal = value.vagaiyara;
          if (vagaiyaraVal && !isNaN(vagaiyaraVal)) {
            vagaiyaraId = parseInt(vagaiyaraVal);
            const [vagaiyaras] = await client.query("SELECT * FROM vagaiyaras WHERE id = ?", [vagaiyaraId]);
            if (vagaiyaras.length > 0) {
              const v = vagaiyaras[0];
              vagaiyaraName = v.our_gen_name_tamil || v.vagaiyara_name_tamil || v.our_gen_name_english || v.vagaiyara_name_english;
              communityId = v.community_id;
              subCommunityId = v.sub_community_id;
              kulamId = v.kula_id;
              kulaDeivamId = v.kula_deivam_id;
            }
          } else {
            vagaiyaraName = vagaiyaraVal || null;
          }

          // Insert into families table
          const insertQuery = `
          INSERT INTO families
          (community_id, sub_community_id, kulam_id, kula_deivam_id, vagaiyara_id, vagaiyara_name, family_nickname, family_type, parent_family_id, status)
          VALUES (?,?,?,?,?,?,?,?,?,?)
        `;
          const [result] = await client.query(insertQuery, [
            communityId,
            subCommunityId,
            kulamId,
            kulaDeivamId,
            vagaiyaraId,
            vagaiyaraName,
            value.vagaiyara_nickname || null,
            value.family_type || 'muthaiya',
            value.parent_family_id || null,
            value.status || 'active'
          ]);

          const familyId = result.insertId;

          // Insert family members
          if (value.family_members && value.family_members.length > 0) {
            const memberInsertQuery = `
              INSERT INTO family_members (family_id, member_name, generation_no, phone_number)
              VALUES ?
            `;
            const memberValues = value.family_members.map(m => [
              familyId,
              m.member_name || value.vagaiyara_nickname || 'Unknown',
              m.generation_no || 1,
              m.phone_number || null
            ]);
            
            await client.query(memberInsertQuery, [memberValues]);
          }

          // Insert eerapu members
          if (value.eerapu_members && value.eerapu_members.length > 0) {
            const eerapuInsertQuery = `
              INSERT INTO family_eerapu (family_id, name, kula_deivam_id, generation_no, status)
              VALUES ?
            `;
            const eerapuValues = value.eerapu_members.map(e => [
              familyId,
              e.name,
              e.kula_deivam_id || null,
              e.generation_no || null,
              e.status || 'active'
            ]);
            await client.query(eerapuInsertQuery, [eerapuValues]);
          }

          callback(null, {
            result: result_success,
            code: 200,
            message: "Kullam People created successfully",
            data: { id: familyId },
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
            SELECT id, community_id, sub_community_id, kulam_id, kula_deivam_id, vagaiyara_id, family_nickname, vagaiyara_name AS vagaiyara, family_type, parent_family_id, status, created_at, updated_at
            FROM families
            ORDER BY id DESC;
          `;
          const [rows] = await client.query(query);

          // Get family members
          if (rows.length > 0) {
            const familyIds = rows.map(r => r.id);
            const membersQuery = `SELECT id, family_id, member_name, generation_no, phone_number FROM family_members WHERE family_id IN (?)`;
            const [members] = await client.query(membersQuery, [familyIds]);
            
            // Get eerapu members
            const eerapuQuery = `SELECT id, family_id, name, kula_deivam_id, generation_no, status FROM family_eerapu WHERE family_id IN (?)`;
            const [eerapuMembers] = await client.query(eerapuQuery, [familyIds]);
            
            rows.forEach(row => {
              row.family_members = members.filter(m => m.family_id === row.id);
              row.eerapu_members = eerapuMembers.filter(e => e.family_id === row.id);
            });
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

  const _getKullamPeopleById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, community_id, sub_community_id, kulam_id, kula_deivam_id, vagaiyara_id, family_nickname, vagaiyara_name AS vagaiyara, family_type, parent_family_id, status, created_at, updated_at
            FROM families
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Kullam People not found" }, null);
          
          const family = rows[0];
          
          const membersQuery = `SELECT id, family_id, member_name, generation_no, phone_number FROM family_members WHERE family_id = ?`;
          const [members] = await client.query(membersQuery, [id]);
          family.family_members = members;

          const eerapuQuery = `SELECT id, family_id, name, kula_deivam_id, generation_no, status FROM family_eerapu WHERE family_id = ?`;
          const [eerapuMembers] = await client.query(eerapuQuery, [id]);
          family.eerapu_members = eerapuMembers;

          callback(null, { result: result_success, code: 200, data: family });
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
          const checkQuery = `SELECT id FROM families WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kullam People not found" }, null);

          let vagaiyaraId = null;
          let vagaiyaraName = null;
          let communityId = null;
          let subCommunityId = null;
          let kulamId = null;
          let kulaDeivamId = null;

          const vagaiyaraVal = value.vagaiyara;
          if (vagaiyaraVal && !isNaN(vagaiyaraVal)) {
            vagaiyaraId = parseInt(vagaiyaraVal);
            const [vagaiyaras] = await client.query("SELECT * FROM vagaiyaras WHERE id = ?", [vagaiyaraId]);
            if (vagaiyaras.length > 0) {
              const v = vagaiyaras[0];
              vagaiyaraName = v.our_gen_name_tamil || v.vagaiyara_name_tamil || v.our_gen_name_english || v.vagaiyara_name_english;
              communityId = v.community_id;
              subCommunityId = v.sub_community_id;
              kulamId = v.kula_id;
              kulaDeivamId = v.kula_deivam_id;
            }
          } else {
            vagaiyaraName = vagaiyaraVal || null;
          }

          const updateQuery = `
            UPDATE families
            SET community_id = ?, sub_community_id = ?, kulam_id = ?, kula_deivam_id = ?, vagaiyara_id = ?, vagaiyara_name = ?, family_nickname = ?, family_type = ?, parent_family_id = ?, status = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            communityId,
            subCommunityId,
            kulamId,
            kulaDeivamId,
            vagaiyaraId,
            vagaiyaraName,
            value.vagaiyara_nickname || null,
            value.family_type || 'muthaiya',
            value.parent_family_id || null,
            value.status || 'active',
            value.id,
          ]);

          // Delete existing members
          await client.query(`DELETE FROM family_members WHERE family_id = ?`, [value.id]);

          // Insert new members
          if (value.family_members && value.family_members.length > 0) {
            const memberInsertQuery = `
              INSERT INTO family_members (family_id, member_name, generation_no, phone_number)
              VALUES ?
            `;
            const memberValues = value.family_members.map(m => [
              value.id,
              m.member_name || value.vagaiyara_nickname || 'Unknown',
              m.generation_no || 1,
              m.phone_number || null
            ]);
            await client.query(memberInsertQuery, [memberValues]);
          }

          // Delete existing eerapu members
          await client.query(`DELETE FROM family_eerapu WHERE family_id = ?`, [value.id]);

          // Insert new eerapu members
          if (value.eerapu_members && value.eerapu_members.length > 0) {
            const eerapuInsertQuery = `
              INSERT INTO family_eerapu (family_id, name, kula_deivam_id, generation_no, status)
              VALUES ?
            `;
            const eerapuValues = value.eerapu_members.map(e => [
              value.id,
              e.name,
              e.kula_deivam_id || null,
              e.generation_no || null,
              e.status || 'active'
            ]);
            await client.query(eerapuInsertQuery, [eerapuValues]);
          }

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
          const checkQuery = `SELECT id FROM families WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Kullam People not found" }, null);

          await client.query(`DELETE FROM family_members WHERE family_id = ?`, [value.id]);
          await client.query(`DELETE FROM family_eerapu WHERE family_id = ?`, [value.id]);
          const deleteQuery = `DELETE FROM families WHERE id = ?`;
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
