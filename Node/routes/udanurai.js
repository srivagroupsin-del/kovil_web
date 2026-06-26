const express = require("express");
const router = express.Router();
const winston = require("winston");
const UdanuraiController = require("../model/udanurai");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post("/udanurai/create", authenticate, (req, res, next) => {
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'utsavar_file', maxCount: 1 },
    { name: 'chariot_file', maxCount: 1 },
    { name: 'goddess_photo', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, activityTimelineMiddleware("Udanurai", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  if (req.files) {
    if (req.files['photo']) params.photo = req.files['photo'][0].filename;
    if (req.files['utsavar_file']) params.utsavar_file = req.files['utsavar_file'][0].filename;
    if (req.files['chariot_file']) params.chariot_file = req.files['chariot_file'][0].filename;
    if (req.files['goddess_photo']) params.goddess_photo = req.files['goddess_photo'][0].filename;
  }
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    UdanuraiController.CreateUdanurai(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/udanurais", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    UdanuraiController.GetUdanurais((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/udanurai/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    UdanuraiController.GetUdanuraiById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/udanurai/temple/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_id = req.params.temple_id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { temple_id, ...params }, data: params }));
    UdanuraiController.GetUdanuraiByTempleId(temple_id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { temple_id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/udanurai/update/:id", authenticate, (req, res, next) => {
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'utsavar_file', maxCount: 1 },
    { name: 'chariot_file', maxCount: 1 },
    { name: 'goddess_photo', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, activityTimelineMiddleware("Udanurai", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };
  if (req.files) {
    if (req.files['photo']) params.photo = req.files['photo'][0].filename;
    if (req.files['utsavar_file']) params.utsavar_file = req.files['utsavar_file'][0].filename;
    if (req.files['chariot_file']) params.chariot_file = req.files['chariot_file'][0].filename;
    if (req.files['goddess_photo']) params.goddess_photo = req.files['goddess_photo'][0].filename;
  }
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    UdanuraiController.UpdateUdanurai(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/udanurai/delete/:id", authenticate, activityTimelineMiddleware("Udanurai", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    UdanuraiController.DeleteUdanurai(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
