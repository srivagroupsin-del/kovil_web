const express = require("express");
const router = express.Router();
const winston = require("winston");
const CommunitySelectionsController = require("../model/community_selections");

const result_failure = "Failure";

router.post("/community-selection/create", async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  try {
    winston.info(JSON.stringify({ url, params }));
    CommunitySelectionsController.CreateSelection(params, (error, result) => {
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

router.get("/community-selections", async (req, res) => {
  const url = req.originalUrl;
  try {
    winston.info(JSON.stringify({ url }));
    CommunitySelectionsController.GetSelections((error, result) => {
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

router.get("/community-selection/:id", async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  try {
    winston.info(JSON.stringify({ url, id }));
    CommunitySelectionsController.GetSelectionById(id, (error, result) => {
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

router.put("/community-selection/update/:id", async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params }));
    CommunitySelectionsController.UpdateSelection(params, (error, result) => {
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

router.delete("/community-selection/delete/:id", async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params }));
    CommunitySelectionsController.DeleteSelection(params, (error, result) => {
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
