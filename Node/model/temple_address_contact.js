const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const templeAddressContactSchema = Joi.object({
  id: Joi.number().integer().optional(),
  door_number: Joi.string().allow('', null).optional(),
  building_name: Joi.string().allow('', null).optional(),
  street_name: Joi.string().allow('', null).optional(),
  landmark: Joi.string().allow('', null).optional(),
  area_name: Joi.string().allow('', null).optional(),
  pincode: Joi.string().allow('', null).optional(),
  country: Joi.string().allow('', null).optional(),
  latitude: Joi.string().allow('', null).optional(),
  longitude: Joi.string().allow('', null).optional(),
  pooja_phone: Joi.string().allow('', null).optional(),
  pooja_email: Joi.string().email().allow('', null).optional(),
  nerthikadan_phone: Joi.string().allow('', null).optional(),
  nerthikadan_email: Joi.string().email().allow('', null).optional(),
  annadhanam_phone: Joi.string().allow('', null).optional(),
  donation_phone: Joi.string().allow('', null).optional(),
  kadhukuthu_phone: Joi.string().allow('', null).optional(),
  mudithalai_phone: Joi.string().allow('', null).optional(),
  bhakthar_group_phone: Joi.string().allow('', null).optional(),
  bhakthar_group_email: Joi.string().email().allow('', null).optional()
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const TempleAddressContactController = (function () {
  
  const _createTempleAddressContact = async (jsonValue, callback) => {
    const { error, value } = templeAddressContactSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO temple_address_contact
          (door_number, building_name, street_name, landmark, area_name, pincode, country, latitude, longitude, pooja_phone, pooja_email, nerthikadan_phone, nerthikadan_email, annadhanam_phone, donation_phone, kadhukuthu_phone, mudithalai_phone, bhakthar_group_phone, bhakthar_group_email)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.door_number || null,
            value.building_name || null,
            value.street_name || null,
            value.landmark || null,
            value.area_name || null,
            value.pincode || null,
            value.country || null,
            value.latitude || null,
            value.longitude || null,
            value.pooja_phone || null,
            value.pooja_email || null,
            value.nerthikadan_phone || null,
            value.nerthikadan_email || null,
            value.annadhanam_phone || null,
            value.donation_phone || null,
            value.kadhukuthu_phone || null,
            value.mudithalai_phone || null,
            value.bhakthar_group_phone || null,
            value.bhakthar_group_email || null,
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Temple address and contact created successfully",
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

  const _getTempleAddressContact = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT * FROM temple_address_contact ORDER BY id DESC;
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

  const _getTempleAddressContactById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT * FROM temple_address_contact WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Temple address and contact not found" }, null);
          
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

  const _updateTempleAddressContact = async (jsonValue, callback) => {
    const { error, value } = templeAddressContactSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM temple_address_contact WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Temple address and contact not found" }, null);

          const updateQuery = `
            UPDATE temple_address_contact
            SET door_number = ?, building_name = ?, street_name = ?, landmark = ?, area_name = ?, pincode = ?, country = ?, latitude = ?, longitude = ?, pooja_phone = ?, pooja_email = ?, nerthikadan_phone = ?, nerthikadan_email = ?, annadhanam_phone = ?, donation_phone = ?, kadhukuthu_phone = ?, mudithalai_phone = ?, bhakthar_group_phone = ?, bhakthar_group_email = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.door_number || null,
            value.building_name || null,
            value.street_name || null,
            value.landmark || null,
            value.area_name || null,
            value.pincode || null,
            value.country || null,
            value.latitude || null,
            value.longitude || null,
            value.pooja_phone || null,
            value.pooja_email || null,
            value.nerthikadan_phone || null,
            value.nerthikadan_email || null,
            value.annadhanam_phone || null,
            value.donation_phone || null,
            value.kadhukuthu_phone || null,
            value.mudithalai_phone || null,
            value.bhakthar_group_phone || null,
            value.bhakthar_group_email || null,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Temple address and contact updated successfully" });
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

  const _deleteTempleAddressContact = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM temple_address_contact WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Temple address and contact not found" }, null);

          const deleteQuery = `DELETE FROM temple_address_contact WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Temple address and contact deleted successfully" });
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
    CreateTempleAddressContact: _createTempleAddressContact,
    GetTempleAddressContact: _getTempleAddressContact,
    GetTempleAddressContactById: _getTempleAddressContactById,
    UpdateTempleAddressContact: _updateTempleAddressContact,
    DeleteTempleAddressContact: _deleteTempleAddressContact,
  };
})();

module.exports = TempleAddressContactController;
