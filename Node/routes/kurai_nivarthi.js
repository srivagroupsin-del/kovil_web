const express = require("express");
const router = express.Router();
const winston = require("winston");
const KuraiNivarthiController = require("../model/kurai_nivarthi");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post("/kurai_nivarthi/create", authenticate, upload.single('photo'), activityTimelineMiddleware("KuraiNivarthi", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = {
    ...req.body,
    image_path: req.file ? req.file.filename : null
  };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KuraiNivarthiController.CreateKuraiNivarthi(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/kurai_nivarthi", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KuraiNivarthiController.GetKuraiNivarthi((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/kurai_nivarthi/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    KuraiNivarthiController.GetKuraiNivarthiById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/kurai_nivarthi/temple/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_id = req.params.temple_id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { temple_id, ...params }, data: params }));
    KuraiNivarthiController.GetKuraiNivarthiByTempleId(temple_id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { temple_id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/kurai_nivarthi/update/:id", authenticate, upload.single('photo'), activityTimelineMiddleware("KuraiNivarthi", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { 
    ...req.body, 
    id: req.params.id,
    image_path: req.file ? req.file.filename : (req.body.image_path || null)
  };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KuraiNivarthiController.UpdateKuraiNivarthi(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/kurai_nivarthi/delete/:id", authenticate, activityTimelineMiddleware("KuraiNivarthi", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KuraiNivarthiController.DeleteKuraiNivarthi(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
