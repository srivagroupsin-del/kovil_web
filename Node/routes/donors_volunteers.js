const express = require("express");
const router = express.Router();
const winston = require("winston");
const DonorsVolunteersController = require("../model/donors_volunteers");
const authenticate = require("../lib/authMiddleware");
const upload = require("../lib/upload");

const result_failure = "Failure";

router.post("/donors-volunteers", authenticate, upload.single('photo'), async (req, res) => {
  const url = req.originalUrl;
  
  let bodyData;
  if (typeof req.body.data === 'string') {
    try {
      bodyData = JSON.parse(req.body.data);
    } catch (err) {
      return res.status(400).json({ data: { result: result_failure, code: 400, message: "Invalid JSON format in data field" } });
    }
  } else {
    bodyData = req.body;
  }

  const params = {
    ...bodyData,
    photo_path: req.file ? req.file.filename : null
  };

  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    DonorsVolunteersController.CreateDonorVolunteer(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.get("/donors-volunteers/:temple_id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = { ...req.params, ...req.query };
  try {
    winston.info(JSON.stringify({ url, params }));
    DonorsVolunteersController.GetDonorsVolunteers(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.put("/donors-volunteers", authenticate, upload.single('photo'), async (req, res) => {
  const url = req.originalUrl;
  
  let bodyData;
  if (typeof req.body.data === 'string') {
    try {
      bodyData = JSON.parse(req.body.data);
    } catch (err) {
      return res.status(400).json({ data: { result: result_failure, code: 400, message: "Invalid JSON format in data field" } });
    }
  } else {
    bodyData = req.body;
  }

  const params = {
    ...bodyData
  };
  
  if (req.file) {
    params.photo_path = req.file.filename;
  }

  try {
    winston.info(JSON.stringify({ url, params, data: params }));
    DonorsVolunteersController.UpdateDonorVolunteer(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

router.delete("/donors-volunteers/:id", authenticate, async (req, res) => {
  const url = req.originalUrl;
  const params = req.params;
  try {
    winston.info(JSON.stringify({ url, params }));
    DonorsVolunteersController.DeleteDonorVolunteer(params, (error, result) => {
      if (!error) res.json({ data: result });
      else res.status(error.code || 400).json({ data: error });
    });
  } catch (err) {
    winston.error(JSON.stringify({ url, error_msg: err.message }));
    res.status(400).json({ data: { result: result_failure, code: 400, message: err.message } });
  }
});

module.exports = router;
