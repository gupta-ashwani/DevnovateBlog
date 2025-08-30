const axios = require("axios");

const testRegistration = async () => {
  try {
    console.log("Testing registration...");

    const response = await axios.post(
      "http://localhost:5001/api/auth/register",
      {
        username: "testuser123",
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      }
    );

    console.log("✅ Registration successful!");
    console.log("Response:", response.data);
  } catch (error) {
    console.log("❌ Registration failed:");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("Error:", error.message);
    }
  }
};

testRegistration();
