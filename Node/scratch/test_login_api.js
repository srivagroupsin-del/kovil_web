require("dotenv").config();
const LoginController = require("../model/login");

// Test with correct admin credentials
console.log("Testing login with email 'admin@example.com' and password 'admin'...");
LoginController.Login({ email: "admin@example.com", password: "admin" }, (err, result) => {
  if (err) {
    console.error("Test failed: admin login failed with error:", err);
  } else {
    console.log("Test success! Login response:", result);
  }

  // Test with invalid credentials
  console.log("\nTesting login with invalid credentials...");
  LoginController.Login({ email: "admin@example.com", password: "wrong_password" }, (err2, result2) => {
    if (err2) {
      console.log("Test success! Login correctly failed with error:", err2);
    } else {
      console.error("Test failed: login succeeded with wrong password! Response:", result2);
    }
    process.exit(0);
  });
});
