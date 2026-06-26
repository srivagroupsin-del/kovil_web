const express = require("express");
const router = express.Router();
const LoginController = require("../model/login");

router.post("/login", async (req, res) => {
  const params = req.body;
  
  LoginController.Login(params, (err, result) => {
    if (err) {
      console.error("Login controller error:", err);
      return res.status(err.code || 500).json({ error: err.message });
    }
    return res.status(result.code || 200).json(result);
  });
});

module.exports = router;
