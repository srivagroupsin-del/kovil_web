const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const { getConnectionWsinventoryPool } = require('../lib/connection');

const kulaDeivamSchema = Joi.object({
  id: Joi.number().integer().optional(),
  community_id: Joi.number().integer().required(),
  sub_community_id: Joi.number().integer().allow(null, 0).optional(),
  kula_id: Joi.number().integer().allow(null, 0).optional(),
  kula_deivam_name: Joi.string().required(),
  kula_deivam_name_en: Joi.string().required(),
  title: Joi.string().allow('', null).optional(),
  info: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  varalaru: Joi.string().allow('', null).optional(),
  image_path: Joi.string().allow('', null).optional(),
  logo_path: Joi.string().allow('', null).optional(),
  icon_path: Joi.string().allow('', null).optional(),
  status: Joi.string().default('Active'),
});

function saveBase64Image(base64Str, prefix = 'kuladeivam') {
  if (!base64Str || !base64Str.startsWith('data:image/')) {
    return base64Str;
  }
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }
    const mime = matches[1];
    let ext = mime.split('/')[1] || 'png';
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';
    
    const dataBuffer = Buffer.from(matches[2], 'base64');
    const filename = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), dataBuffer);
    return filename;
  } catch (err) {
    console.error(`Failed to save ${prefix} base64 image:`, err);
    return base64Str;
  }
}

class CommunityKulaDeivamController {
  async CreateMapping(req, res) {
    try {
      const { error, value } = kulaDeivamSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ code: 400, message: error.details[0].message });
      }

      const savedImage = saveBase64Image(value.image_path, 'kuladeivam');
      const savedLogo = saveBase64Image(value.logo_path, 'kuladeivam_logo');
      const savedIcon = saveBase64Image(value.icon_path, 'kuladeivam_icon');
      
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return res.status(500).json({ code: 500, message: "Database connection error" });
        try {
          const insertQuery = `
            INSERT INTO community_kula_deivam 
            (community_id, sub_community_id, kula_id, kula_deivam_name, kula_deivam_name_en, title, info, description, varalaru, image_path, logo_path, icon_path, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const [result] = await client.query(insertQuery, [
            value.community_id,
            value.sub_community_id || 0,
            value.kula_id || 0,
            value.kula_deivam_name,
            value.kula_deivam_name_en,
            value.title || null,
            value.info || null,
            value.description || null,
            value.varalaru || null,
            savedImage || null,
            savedLogo || null,
            savedIcon || null,
            value.status || 'Active'
          ]);
          
          res.status(200).json({ code: 200, message: "Mapping created successfully", insertId: result.insertId });
        } catch (dbErr) {
          res.status(500).json({ code: 500, message: dbErr.message });
        } finally {
          client.release();
        }
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: err.message });
    }
  }

  async UpdateMapping(req, res) {
    try {
      const id = req.params.id;
      const { error, value } = kulaDeivamSchema.validate({ ...req.body, id: parseInt(id) });
      if (error) {
        return res.status(400).json({ code: 400, message: error.details[0].message });
      }

      const savedImage = saveBase64Image(value.image_path, 'kuladeivam');
      const savedLogo = saveBase64Image(value.logo_path, 'kuladeivam_logo');
      const savedIcon = saveBase64Image(value.icon_path, 'kuladeivam_icon');

      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return res.status(500).json({ code: 500, message: "Database connection error" });
        try {
          const updateQuery = `
            UPDATE community_kula_deivam 
            SET community_id = ?, sub_community_id = ?, kula_id = ?, kula_deivam_name = ?, kula_deivam_name_en = ?, title = ?, info = ?, description = ?, varalaru = ?, image_path = ?, logo_path = ?, icon_path = ?, status = ?
            WHERE id = ?
          `;
          await client.query(updateQuery, [
            value.community_id,
            value.sub_community_id || 0,
            value.kula_id || 0,
            value.kula_deivam_name,
            value.kula_deivam_name_en,
            value.title || null,
            value.info || null,
            value.description || null,
            value.varalaru || null,
            savedImage || null,
            savedLogo || null,
            savedIcon || null,
            value.status || 'Active',
            id
          ]);
          res.status(200).json({ code: 200, message: "Mapping updated successfully" });
        } catch (dbErr) {
          res.status(500).json({ code: 500, message: dbErr.message });
        } finally {
          client.release();
        }
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: err.message });
    }
  }

  async GetMappings(req, res) {
    try {
      const { community_id, sub_community_id, kula_id } = req.query;
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return res.status(500).json({ code: 500, message: "Database connection error" });
        try {
          let query = 'SELECT * FROM community_kula_deivam WHERE 1=1';
          const params = [];
          
          if (community_id) {
            query += ' AND community_id = ?';
            params.push(community_id);
          }
          if (sub_community_id) {
            query += ' AND sub_community_id = ?';
            params.push(sub_community_id);
          }
          if (kula_id) {
            query += ' AND kula_id = ?';
            params.push(kula_id);
          }
          
          query += ' ORDER BY id DESC';
          
          const [rows] = await client.query(query, params);
          res.status(200).json({ code: 200, data: rows });
        } catch (dbErr) {
          res.status(500).json({ code: 500, message: dbErr.message });
        } finally {
          client.release();
        }
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: err.message });
    }
  }
  
  async DeleteMapping(req, res) {
    try {
      const id = req.params.id;
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return res.status(500).json({ code: 500, message: "Database connection error" });
        try {
          await client.query('DELETE FROM community_kula_deivam WHERE id = ?', [id]);
          res.status(200).json({ code: 200, message: "Deleted successfully" });
        } catch (dbErr) {
          res.status(500).json({ code: 500, message: dbErr.message });
        } finally {
          client.release();
        }
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: err.message });
    }
  }
}

module.exports = CommunityKulaDeivamController;
