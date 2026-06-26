const express = require("express");
const router = express.Router();
const winston = require("winston");
const ThodarPoojaiController = require("../model/thodar_poojai");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post("/thodar_poojai/create", authenticate, upload.single('photo'), activityTimelineMiddleware("ThodarPoojai", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = {
    ...req.body,
    image_path: req.file ? req.file.filename : null
  };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    ThodarPoojaiController.CreateThodarPoojai(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/thodar_poojai", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    ThodarPoojaiController.GetThodarPoojai((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/thodar_poojai/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    ThodarPoojaiController.GetThodarPoojaiById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/thodar_poojai/temple/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_id = req.params.temple_id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { temple_id, ...params }, data: params }));
    ThodarPoojaiController.GetThodarPoojaiByTempleId(temple_id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { temple_id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/thodar_poojai/update/:id", authenticate, upload.single('photo'), activityTimelineMiddleware("ThodarPoojai", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { 
    ...req.body, 
    id: req.params.id,
    image_path: req.file ? req.file.filename : (req.body.image_path || null)
  };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    ThodarPoojaiController.UpdateThodarPoojai(params, (error, result) => {
      if (error) {
        console.log("Thodar Poojai Update Error:", error);
      }
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/thodar_poojai/delete/:id", authenticate, activityTimelineMiddleware("ThodarPoojai", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    ThodarPoojaiController.DeleteThodarPoojai(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
