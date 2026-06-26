const express = require("express");
const router = express.Router();
const winston = require("winston");
const KudamuzhukkuController = require("../model/kudamuzhukku");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");

const result_failure = "Failure";

router.post("/kudamuzhukku/create", authenticate, activityTimelineMiddleware("Kudamuzhukku", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KudamuzhukkuController.CreateKudamuzhukku(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/kudamuzhukkus", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KudamuzhukkuController.GetKudamuzhukkus((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/kudamuzhukku/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    KudamuzhukkuController.GetKudamuzhukkuById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/kudamuzhukku/update/:id", authenticate, activityTimelineMiddleware("Kudamuzhukku", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KudamuzhukkuController.UpdateKudamuzhukku(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/kudamuzhukku/delete/:id", authenticate, activityTimelineMiddleware("Kudamuzhukku", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KudamuzhukkuController.DeleteKudamuzhukku(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
