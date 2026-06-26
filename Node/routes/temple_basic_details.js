const express = require("express");
const router = express.Router();
const winston = require("winston");
const TempleBasicDetailsController = require("../model/temple_basic_details");
const authenticate = require("../lib/authMiddleware");
const activityTimelineMiddleware = require("../lib/activityTimelineMiddleware");

const result_failure = "Failure";

router.post(
  "/temple_basic_detail/create",
  authenticate,
  activityTimelineMiddleware("TempleBasicDetail", "Create"),
  async (req, res) => {
    const url = req.originalUrl;
    const params = req.body;
    try {
      const infoMsg = { url: url, params: params, data: params };
      winston.info(JSON.stringify(infoMsg));

      TempleBasicDetailsController.CreateTempleBasicDetail(params, (error, result) => {
        if (!error) {
          res.json({ data: result });
        } else {
          res.status(error.code || 400).json({ data: error });
        }
      });
    } catch (err) {
      const result = {
        result: result_failure,
        code: 400,
        message: err.message,
      };
      const errorMsg = { url: url, params: params, error_msg: err.message };
      winston.error(JSON.stringify(errorMsg));
      res.status(400).json({ data: result });
    }
  },
);

router.get("/temple_basic_details", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.query;
  try {
    const infoMsg = { url: url, params: params, data: params };
    winston.info(JSON.stringify(infoMsg));

    TempleBasicDetailsController.GetTempleBasicDetails((error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    const result = { result: result_failure, code: 400, message: err.message };
    const errorMsg = { url: url, params: params, error_msg: err.message };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json({ data: result });
  }
});

router.get("/temple_basic_detail/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const id = req.params.id;
  const params = req.query;
  try {
    const infoMsg = { url: url, params: { id, ...params }, data: params };
    winston.info(JSON.stringify(infoMsg));

    TempleBasicDetailsController.GetTempleBasicDetailById(id, (error, result) => {
      if (!error) {
        res.json({ data: result });
      } else {
        res.status(error.code || 400).json({ data: error });
      }
    });
  } catch (err) {
    const result = { result: result_failure, code: 400, message: err.message };
    const errorMsg = {
      url: url,
      params: { id, ...params },
      error_msg: err.message,
    };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json({ data: result });
  }
});

router.put(
  "/temple_basic_detail/update/:id",
  authenticate,
  activityTimelineMiddleware("TempleBasicDetail", "Update"),
  async (req, res) => {
    const url = req.originalUrl;
    const params = { ...req.body, id: req.params.id };
    try {
      const infoMsg = { url: url, params: params, data: params };
      winston.info(JSON.stringify(infoMsg));

      TempleBasicDetailsController.UpdateTempleBasicDetail(params, (error, result) => {
        if (!error) {
          res.json({ data: result });
        } else {
          res.status(error.code || 400).json({ data: error });
        }
      });
    } catch (err) {
      const result = {
        result: result_failure,
        code: 400,
        message: err.message,
      };
      const errorMsg = { url: url, params: params, error_msg: err.message };
      winston.error(JSON.stringify(errorMsg));
      res.status(400).json({ data: result });
    }
  },
);

router.delete(
  "/temple_basic_detail/delete/:id",
  authenticate,
  activityTimelineMiddleware("TempleBasicDetail", "Delete"),
  async (req, res) => {
    const url = req.originalUrl;
    const params = { id: req.params.id };
    try {
      const infoMsg = { url: url, params: params, data: params };
      winston.info(JSON.stringify(infoMsg));

      TempleBasicDetailsController.DeleteTempleBasicDetail(params, (error, result) => {
        if (!error) {
          res.json({ data: result });
        } else {
          res.status(error.code || 400).json({ data: error });
        }
      });
    } catch (err) {
      const result = {
        result: result_failure,
        code: 400,
        message: err.message,
      };
      const errorMsg = { url: url, params: params, error_msg: err.message };
      winston.error(JSON.stringify(errorMsg));
      res.status(400).json({ data: result });
    }
  },
);

module.exports = router;
