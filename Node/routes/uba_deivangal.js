const express = require("express");
const router = express.Router();
const winston = require("winston");
const UbaDeivangalController = require("../model/uba_deivangal");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post(["/create", "/save"], authenticate, (req, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, activityTimelineMiddleware("UbaDeivangal", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;

  if (req.file) {
    params.photo = req.file.filename;
  }

  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    UbaDeivangalController.CreateUbaDeivangal(params, (error, result) => {
      if (!error) res.json(result);
      else res.status(error.code || 400).json(error);
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ result: result_failure, code: 400, message: err.message });
  }
});

router.get("/", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    UbaDeivangalController.GetUbaDeivangal((error, result) => {
      if (!error) res.json(result);
      else res.status(error.code || 400).json(error);
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ result: result_failure, code: 400, message: err.message });
  }
});

router.get("/temple/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_id = req.params.temple_id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { temple_id, ...params }, data: params }));
    UbaDeivangalController.GetUbaDeivangalByTempleId(temple_id, (error, result) => {
      if (!error) res.json(result);
      else res.status(error.code || 400).json(error);
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { temple_id, ...params }, error_msg: err.message }));
    res.status(400).json({ result: result_failure, code: 400, message: err.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    UbaDeivangalController.GetUbaDeivangalById(id, (error, result) => {
      if (!error) res.json(result);
      else res.status(error.code || 400).json(error);
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ result: result_failure, code: 400, message: err.message });
  }
});

router.put("/update/:id", authenticate, (req, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, activityTimelineMiddleware("UbaDeivangal", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };

  if (req.file) {
    params.photo = req.file.filename;
  }

  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    UbaDeivangalController.UpdateUbaDeivangal(params, (error, result) => {
      if (!error) res.json(result);
      else res.status(error.code || 400).json(error);
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ result: result_failure, code: 400, message: err.message });
  }
});

router.delete("/:id", authenticate, activityTimelineMiddleware("UbaDeivangal", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    UbaDeivangalController.DeleteUbaDeivangal(params, (error, result) => {
      if (!error) res.json(result);
      else res.status(error.code || 400).json(error);
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ result: result_failure, code: 400, message: err.message });
  }
});

module.exports = router;
