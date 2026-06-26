const express = require("express");
const router = express.Router();
const axios = require("axios");
const winston = require("winston");
const ApiKeyModel = require("../model/apiKey");

const getExternalHeaders = async (serviceName, platformType) => {
  const activeKeyRecord = await ApiKeyModel.getActiveKey(
    serviceName,
    platformType,
  );
  if (!activeKeyRecord || !activeKeyRecord.access_token) {
    throw new Error(
      `No active API key found for service: ${serviceName}, platform: ${platformType}`,
    );
  }
  return {
    "x-api-key": activeKeyRecord.access_token,
    "x-service-name": serviceName,
    "x-platform": platformType,
  };
};

router.get("/outsideapis/categories", async (req, res) => {
  const url = req.originalUrl;
  try {
    const infoMsg = {
      url: url,
      message: "Fetching categories from external API",
    };
    winston.info(JSON.stringify(infoMsg));

    // Fetch external API headers from database
    const externalHeaders = await getExternalHeaders("login", "WEB");

    // Fetch data from the external API
    const response = await axios.get(`https://srivagroups.in/api/categories?t=${Date.now()}`, {
      headers: externalHeaders,
    });

    // Return the response directly to the client
    res.json(response.data);
  } catch (err) {
    const result = { result: "Failure", code: 400, message: err.message };
    const errorMsg = { url: url, error_msg: err.message };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json(result);
  }
});

router.get("/outsideapis/deity-sectors", async (req, res) => {
  const url = req.originalUrl;
  try {
    const infoMsg = {
      url: url,
      message: "Fetching deity sectors from external API",
    };
    winston.info(JSON.stringify(infoMsg));

    // Fetch external API headers from database
    const externalHeaders = await getExternalHeaders("login", "WEB");

    // Fetch data from the external API
    const response = await axios.get("https://srivagroups.in/api/sectors", {
      params: { ...req.query, t: Date.now() },
      headers: externalHeaders,
    });

    let sectorsList = [];
    if (response.data && Array.isArray(response.data.data)) {
      sectorsList = response.data.data;
    } else if (Array.isArray(response.data)) {
      sectorsList = response.data;
    }

    const filtered = sectorsList.filter(s => 
      s.sector_title_name && s.sector_title_name.trim().toLowerCase() === 'gods'
    );

    if (response.data && response.data.data) {
      res.json({ ...response.data, data: filtered });
    } else {
      res.json(filtered);
    }
  } catch (err) {
    const result = { result: "Failure", code: 400, message: err.message };
    const errorMsg = { url: url, error_msg: err.message };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json(result);
  }
});

router.get("/outsideapis/sectors", async (req, res) => {
  const url = req.originalUrl;
  try {
    const infoMsg = {
      url: url,
      message: "Fetching sectors from external API",
    };
    winston.info(JSON.stringify(infoMsg));

    // Fetch external API headers from database
    const externalHeaders = await getExternalHeaders("login", "WEB");

    // Fetch data from the external API
    const response = await axios.get("https://srivagroups.in/api/sectors", {
      params: { ...req.query, t: Date.now() },
      headers: externalHeaders,
    });

    // Return the response directly to the client
    res.json(response.data);
  } catch (err) {
    const result = { result: "Failure", code: 400, message: err.message };
    const errorMsg = { url: url, error_msg: err.message };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json(result);
  }
});

router.get("/outsideapis/sub-sectors", async (req, res) => {
  const url = req.originalUrl;
  try {
    const infoMsg = {
      url: url,
      message: "Fetching sub-sectors from external API",
    };
    winston.info(JSON.stringify(infoMsg));

    // Fetch external API headers from database
    const externalHeaders = await getExternalHeaders("login", "WEB");

    // Fetch data from the external API
    const response = await axios.get("https://srivagroups.in/api/sub-sectors", {
      params: { ...req.query, t: Date.now() },
      headers: externalHeaders,
    });

    // Return the response directly to the client
    res.json(response.data);
  } catch (err) {
    const result = { result: "Failure", code: 400, message: err.message };
    const errorMsg = { url: url, error_msg: err.message };
    winston.error(JSON.stringify(errorMsg));
    res.status(400).json(result);
  }
});

module.exports = router;
