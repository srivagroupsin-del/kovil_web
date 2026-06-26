const express = require("express");
const router = express.Router();
const winston = require("winston");
const MoolavarController = require("../model/moolavar");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post("/moolavar/create", authenticate, (req, res, next) => {
  upload.fields([
    { name: 'photo', maxCount: 5 },
    { name: 'utsavar_file', maxCount: 1 },
    { name: 'chariot_file', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, activityTimelineMiddleware("Moolavar", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  let photoList = [];
  if (req.body.existing_photos) {
    photoList.push(...req.body.existing_photos.split(',').map(s => s.trim()).filter(Boolean));
  }
  if (req.files && req.files['photo']) {
    photoList.push(...req.files['photo'].map(file => file.filename));
  }
  if (photoList.length > 0) {
    params.photo = photoList.join(', ');
  }

  if (req.files) {
    if (req.files['utsavar_file']) params.utsavar_file = req.files['utsavar_file'][0].filename;
    if (req.files['chariot_file']) params.chariot_file = req.files['chariot_file'][0].filename;
  }
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    MoolavarController.CreateMoolavar(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/moolavars", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    MoolavarController.GetMoolavars((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/moolavar/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    MoolavarController.GetMoolavarById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/moolavar/temple/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_id = req.params.temple_id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { temple_id, ...params }, data: params }));
    MoolavarController.GetMoolavarByTempleId(temple_id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { temple_id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/moolavar/update/:id", authenticate, (req, res, next) => {
  upload.fields([
    { name: 'photo', maxCount: 5 },
    { name: 'utsavar_file', maxCount: 1 },
    { name: 'chariot_file', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, activityTimelineMiddleware("Moolavar", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };
  let photoList = [];
  if (req.body.existing_photos) {
    photoList.push(...req.body.existing_photos.split(',').map(s => s.trim()).filter(Boolean));
  }
  if (req.files && req.files['photo']) {
    photoList.push(...req.files['photo'].map(file => file.filename));
  }
  if (photoList.length > 0) {
    params.photo = photoList.join(', ');
  } else {
    params.photo = null;
  }

  if (req.files) {
    if (req.files['utsavar_file']) params.utsavar_file = req.files['utsavar_file'][0].filename;
    if (req.files['chariot_file']) params.chariot_file = req.files['chariot_file'][0].filename;
  }
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    MoolavarController.UpdateMoolavar(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/moolavar/delete/:id", authenticate, activityTimelineMiddleware("Moolavar", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    MoolavarController.DeleteMoolavar(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
