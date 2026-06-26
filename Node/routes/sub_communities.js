const express = require("express");
const router = express.Router();
const winston = require("winston");
const SubCommunitiesController = require("../model/sub_communities");

const result_failure = "Failure";

router.post("/sub-community/create", async (req, res) => {
  const url = req.originalUrl;
  const params = req.body;
  try {
    winston.info(JSON.stringify({ url, params }));
    SubCommunitiesController.CreateSubCommunity(params, (error, result) => {
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

router.get("/sub-communities", async (req, res) => {
  const url = req.originalUrl;
  try {
    winston.info(JSON.stringify({ url }));
    SubCommunitiesController.GetSubCommunities((error, result) => {
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

router.get("/sub-community/:id", async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  try {
    winston.info(JSON.stringify({ url, id }));
    SubCommunitiesController.GetSubCommunityById(id, (error, result) => {
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

router.put("/sub-community/update/:id", async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.body, id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params }));
    SubCommunitiesController.UpdateSubCommunity(params, (error, result) => {
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

router.delete("/sub-community/delete/:id", async (req, res) => {
  const url = req.originalUrl;
  const params = { id: req.params.id };
  try {
    winston.info(JSON.stringify({ url, params }));
    SubCommunitiesController.DeleteSubCommunity(params, (error, result) => {
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
