// Simple test to validate Cloudinary configuration
const cloudinary = require("../config/cloudinary");

async function testCloudinaryConnection() {
  try {
    console.log("Testing Cloudinary connection...");

    // Test the API connection by attempting to retrieve account info
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCloudinaryConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

module.exports = testCloudinaryConnection;
