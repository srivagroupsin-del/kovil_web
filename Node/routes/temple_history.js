const express = require("express");
const router = express.Router();
const winston = require("winston");
const TempleHistoryController = require("../model/temple_history");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post("/temple_history/create", authenticate, (req, res, next) => {
  upload.single("photo_path")(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, activityTimelineMiddleware("TempleHistory", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  if (req.file) {
    params.photo_path = req.file.filename;
  }
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    TempleHistoryController.CreateTempleHistory(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/temple_histories", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    TempleHistoryController.GetTempleHistories((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/temple_history/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    TempleHistoryController.GetTempleHistoryById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/temple_history/update/:id", authenticate, (req, res, next) => {
  upload.single("photo_path")(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, activityTimelineMiddleware("TempleHistory", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };
  if (req.file) {
    params.photo_path = req.file.filename;
  }
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    TempleHistoryController.UpdateTempleHistory(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/temple_history/delete/:id", authenticate, activityTimelineMiddleware("TempleHistory", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    TempleHistoryController.DeleteTempleHistory(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
