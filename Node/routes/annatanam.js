const express = require("express");
const router = express.Router();
const winston = require("winston");
const AnnatanamController = require("../model/annatanam");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post("/annatanam/create", authenticate, upload.single('photo'), activityTimelineMiddleware("Annatanam", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = {
    ...req.body,
    count: req.body.count ? parseInt(req.body.count) : null,
    amount: req.body.amount ? parseFloat(req.body.amount) : null,
    image_path: req.file ? req.file.filename : null
  };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    AnnatanamController.CreateAnnatanam(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/annatanam", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    AnnatanamController.GetAnnatanam((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/annatanam/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    AnnatanamController.GetAnnatanamById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/annatanam/temple/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_id = req.params.temple_id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { temple_id, ...params }, data: params }));
    AnnatanamController.GetAnnatanamByTempleId(temple_id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { temple_id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/annatanam/update/:id", authenticate, upload.single('photo'), activityTimelineMiddleware("Annatanam", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { 
    ...req.body, 
    id: req.params.id,
    count: req.body.count ? parseInt(req.body.count) : null,
    amount: req.body.amount ? parseFloat(req.body.amount) : null,
    image_path: req.file ? req.file.filename : (req.body.image_path || null)
  };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    AnnatanamController.UpdateAnnatanam(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/annatanam/delete/:id", authenticate, activityTimelineMiddleware("Annatanam", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    AnnatanamController.DeleteAnnatanam(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
