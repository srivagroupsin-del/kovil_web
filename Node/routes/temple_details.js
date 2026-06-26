const express = require("express");
const router = express.Router();
const winston = require("winston");
const TempleDetailsController = require("../model/temple_details");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";



router.post(
  "/temple_detail/create",
  authenticate,
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  activityTimelineMiddleware("TempleDetail", "Create"),
  async (req, res) => {
    const url = req.originalUrl;
    const params = { ...req.body };
    
    // Process files if present
    let theivankalVal = params.theivankal;
    if (typeof theivankalVal === 'string') {
      try {
        theivankalVal = JSON.parse(theivankalVal);
      } catch (e) {
        theivankalVal = [];
      }
    }
    if (Array.isArray(theivankalVal)) {
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          const match = file.fieldname.match(/^theivankal_photo_(\d+)$/);
          if (match) {
            const index = parseInt(match[1], 10);
            if (theivankalVal[index]) {
              theivankalVal[index].photo = file.filename;
            }
          }
        });
      }
      
      theivankalVal.forEach(t => {
        if (!t.photo || t.photo.trim() === '') {
          t.photo = '';
        }
      });
      
      params.theivankal = theivankalVal;
    }

    try {
      const infoMsg = { url: url, params: params, data: params };
      winston.info(JSON.stringify(infoMsg));

      TempleDetailsController.CreateTempleDetail(params, (error, result) => {
        if (!error) {
          res.json({ data: result });
        } else {
          res.status(error.code || 400).json({ data: error });
        }
      });
    } catch (err) {
      const result = {
        result: result_failure,
        code: 400,
        message: err.message,
      };
      const errorMsg = { url: url, params: params, error_msg: err.message };
      winston.error(JSON.stringify(errorMsg));
      res.status(400).json({ data: result });
    }
  },
);

router.get("/temple_details", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    const infoMsg = { url: url, params: params, data: params };
    winston.info(JSON.stringify(infoMsg));

    TempleDetailsController.GetTempleDetails((error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    const result = { result: result_failure, code: 400, message: err.message };
    const errorMsg = { url: url, params: params, error_msg: err.message };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json({ data: result });
  }
});

router.get("/temple_detail/basic/:temple_basic_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_basic_id = req.params.temple_basic_id;
  const params = req.query;
  try {
    const infoMsg = { url: url, params: { temple_basic_id, ...params }, data: params };
    winston.info(JSON.stringify(infoMsg));

    TempleDetailsController.GetTempleDetailByBasicId(temple_basic_id, (error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    const result = { result: result_failure, code: 400, message: err.message };
    const errorMsg = {
      url: url,
      params: { temple_basic_id, ...params },
      error_msg: err.message,
    };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json({ data: result });
  }
});

router.get("/temple_detail/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    const infoMsg = { url: url, params: { id, ...params }, data: params };
    winston.info(JSON.stringify(infoMsg));

    TempleDetailsController.GetTempleDetailById(id, (error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    const result = { result: result_failure, code: 400, message: err.message };
    const errorMsg = {
      url: url,
      params: { id, ...params },
      error_msg: err.message,
    };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json({ data: result });
  }
});

router.put(
  "/temple_detail/update/:id",
  authenticate,
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  activityTimelineMiddleware("TempleDetail", "Update"),
  async (req, res) => {
    const url = req.originalUrl;
    const params = { ...req.body, id: req.params.id };

    // Process files if present
    let theivankalVal = params.theivankal;
    if (typeof theivankalVal === 'string') {
      try {
        theivankalVal = JSON.parse(theivankalVal);
      } catch (e) {
        theivankalVal = [];
      }
    }
    if (Array.isArray(theivankalVal)) {
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          const match = file.fieldname.match(/^theivankal_photo_(\d+)$/);
          if (match) {
            const index = parseInt(match[1], 10);
            if (theivankalVal[index]) {
              theivankalVal[index].photo = file.filename;
            }
          }
        });
      }
      
      theivankalVal.forEach(t => {
        if (!t.photo || t.photo.trim() === '') {
          t.photo = '';
        }
      });
      
      params.theivankal = theivankalVal;
    }

    try {
      const infoMsg = { url: url, params: params, data: params };
      winston.info(JSON.stringify(infoMsg));

      TempleDetailsController.UpdateTempleDetail(params, (error, result) => {
        if (!error) {
          res.json({ data: result });
        } else {
          res.status(error.code || 400).json({ data: error });
        }
      });
    } catch (err) {
      const result = {
        result: result_failure,
        code: 400,
        message: err.message,
      };
      const errorMsg = { url: url, params: params, error_msg: err.message };
      winston.error(JSON.stringify(errorMsg));
      res.status(400).json({ data: result });
    }
  },
);

router.delete(
  "/temple_detail/delete/:id",
  authenticate,
  activityTimelineMiddleware("TempleDetail", "Delete"),
  async (req, res) => {
    const url = req.originalUrl;
    const params = { id: req.params.id };
    try {
      const infoMsg = { url: url, params: params, data: params };
      winston.info(JSON.stringify(infoMsg));

      TempleDetailsController.DeleteTempleDetail(params, (error, result) => {
        if (!error) {
          res.json({ data: result });
        } else {
          res.status(error.code || 400).json({ data: error });
        }
      });
    } catch (err) {
      const result = {
        result: result_failure,
        code: 400,
        message: err.message,
      };
      const errorMsg = { url: url, params: params, error_msg: err.message };
      winston.error(JSON.stringify(errorMsg));
      res.status(400).json({ data: result });
    }
  },
);

module.exports = router;
