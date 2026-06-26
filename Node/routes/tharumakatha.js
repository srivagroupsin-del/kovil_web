const express = require("express");
const router = express.Router();
const winston = require("winston");
const TharumakathaController = require("../model/tharumakatha");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post("/tharumakatha/create", authenticate, upload.single('photo'), activityTimelineMiddleware("Tharumakatha", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = {
    ...req.body,
    photo_path: req.file ? req.file.filename : null
  };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    TharumakathaController.CreateTharumakatha(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/tharumakatha", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    TharumakathaController.GetTharumakatha((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/tharumakatha/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    TharumakathaController.GetTharumakathaById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/tharumakatha/temple/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_id = req.params.temple_id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { temple_id, ...params }, data: params }));
    TharumakathaController.GetTharumakathaByTempleId(temple_id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { temple_id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/tharumakatha/update/:id", authenticate, upload.single('photo'), activityTimelineMiddleware("Tharumakatha", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { 
    ...req.body, 
    id: req.params.id,
    photo_path: req.file ? req.file.filename : null
  };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    TharumakathaController.UpdateTharumakatha(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/tharumakatha/delete/:id", authenticate, activityTimelineMiddleware("Tharumakatha", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    TharumakathaController.DeleteTharumakatha(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.post("/tharumakatha/login", async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  try {
    winston.info(JSON.stringify({ url, params: { phone: params.phone } })); // log without password
    TharumakathaController.LoginTharumakatha(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
