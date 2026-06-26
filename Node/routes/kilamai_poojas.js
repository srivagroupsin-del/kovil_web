const express = require("express");
const router = express.Router();
const winston = require("winston");
const KilamaiPoojasController = require("../model/kilamai_poojas");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");

const result_failure = "Failure";

router.post("/kilamai_poojas/create", authenticate, activityTimelineMiddleware("KilamaiPoojas", "Create"), async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KilamaiPoojasController.CreateKilamaiPoojas(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/kilamai_poojas", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KilamaiPoojasController.GetKilamaiPoojas((error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/kilamai_poojas/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { id, ...params }, data: params }));
    KilamaiPoojasController.GetKilamaiPoojasById(id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/kilamai_poojas/temple/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const temple_id = req.params.temple_id;
  const params = req.query;
  try {
    winston.info(JSON.stringify({ url, params: { temple_id, ...params }, data: params }));
    KilamaiPoojasController.GetKilamaiPoojasByTempleId(temple_id, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params: { temple_id, ...params }, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/kilamai_poojas/update/:id", authenticate, activityTimelineMiddleware("KilamaiPoojas", "Update"), async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KilamaiPoojasController.UpdateKilamaiPoojas(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/kilamai_poojas/delete/:id", authenticate, activityTimelineMiddleware("KilamaiPoojas", "Delete"), async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    KilamaiPoojasController.DeleteKilamaiPoojas(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
