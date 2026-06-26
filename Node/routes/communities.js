const express = require("express");
const router = express.Router();
const winston = require("winston");
const CommunitiesController = require("../model/communities");

const result_failure = "Failure";

router.post("/community/create", async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  try {
    winston.info(JSON.stringify({ url, params }));
    CommunitiesController.CreateCommunity(params, (error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/communities", async (req, res) => {
  const url = req.originalUrl;
  try {
    winston.info(JSON.stringify({ url }));
    CommunitiesController.GetCommunities((error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/community/:id", async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  try {
    winston.info(JSON.stringify({ url, id }));
    CommunitiesController.GetCommunityById(id, (error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, id, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/community/update/:id", async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params }));
    CommunitiesController.UpdateCommunity(params, (error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/community/delete/:id", async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params }));
    CommunitiesController.DeleteCommunity(params, (error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, params, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
