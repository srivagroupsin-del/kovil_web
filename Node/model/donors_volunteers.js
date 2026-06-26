const Joi = require("joi");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const donorsVolunteersSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().required(),
  phone: Joi.string().allow('', null).optional(),
  type: Joi.string().valid('Donor', 'Volunteer', 'Both').required(),
  donation_details: Joi.string().allow('', null).optional(),
  assigned_service: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional().default('active'),
  temple_id: Joi.number().integer().required(),
  photo_path: Joi.string().allow('', null).optional()
});

const DonorsVolunteersController = {
  CreateDonorVolunteer: (params, callback) => {
    const { error, value: validatedValue } = donorsVolunteersSchema.validate(params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return callback({ result: result_failure, code: 400, message: errorMessage }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
            INSERT INTO donors_volunteers 
            (name, phone, type, donation_details, assigned_service, photo_path, status, temple_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const queryParams = [
            validatedValue.name,
            validatedValue.phone || null,
            validatedValue.type,
            validatedValue.donation_details || null,
            validatedValue.assigned_service || null,
            validatedValue.photo_path || null,
            validatedValue.status || 'active',
            validatedValue.temple_id
          ];

          const [result] = await client.query(insertQuery, queryParams);

          callback(null, { result: result_success, code: 200, message: "Donor/Volunteer added successfully", id: result.insertId });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 400, message: e.message }, null);
    }
  },

  GetDonorsVolunteers: (params, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = "SELECT * FROM donors_volunteers WHERE temple_id = ?";
          const [results] = await client.query(query, [params.temple_id]);
          callback(null, { result: result_success, code: 200, data: results });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 400, message: e.message }, null);
    }
  },

  UpdateDonorVolunteer: (params, callback) => {
    if (!params.id) {
      return callback({ result: result_failure, code: 400, message: "\"id\" is required" }, null);
    }

    const { error, value: validatedValue } = donorsVolunteersSchema.validate(params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return callback({ result: result_failure, code: 400, message: errorMessage }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          let updateQuery = `
            UPDATE donors_volunteers
            SET name = ?, phone = ?, type = ?, donation_details = ?, assigned_service = ?, status = ?, temple_id = ?
          `;
          
          const queryParams = [
            validatedValue.name,
            validatedValue.phone || null,
            validatedValue.type,
            validatedValue.donation_details || null,
            validatedValue.assigned_service || null,
            validatedValue.status || 'active',
            validatedValue.temple_id
          ];

          if (validatedValue.photo_path !== undefined) {
            updateQuery += `, photo_path = ?`;
            queryParams.push(validatedValue.photo_path);
          }

          updateQuery += ` WHERE id = ?`;
          queryParams.push(validatedValue.id);

          await client.query(updateQuery, queryParams);

          callback(null, { result: result_success, code: 200, message: "Donor/Volunteer updated successfully" });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 400, message: e.message }, null);
    }
  },

  DeleteDonorVolunteer: (params, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const deleteQuery = "DELETE FROM donors_volunteers WHERE id = ?";
          await client.query(deleteQuery, [params.id]);

          callback(null, { result: result_success, code: 200, message: "Donor/Volunteer deleted successfully" });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 400, message: e.message }, null);
    }
  }
};

module.exports = DonorsVolunteersController;
