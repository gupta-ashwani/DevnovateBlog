const mongoose = require("mongoose");
const User = require("../src/models/User");
require("dotenv").config();

const createDemoAccount = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/devnovate-blog",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("📊 MongoDB connected successfully");

    // Check if demo account already exists
    const existingDemo = await User.findOne({ email: "demo@devnovate.com" });

    if (existingDemo) {
      console.log("✅ Demo account already exists");
      console.log("📧 Email: demo@devnovate.com");
      console.log("🔑 Password: demo123");
      process.exit(0);
    }

    // Create demo account
    const demoUser = await User.create({
      username: "demo_user",
      email: "demo@devnovate.com",
      password: "demo123",
      firstName: "Demo",
      lastName: "User",
      bio: "This is a demo account for testing the Devnovate blogging platform. Feel free to explore all the features!",
      role: "user",
      socialLinks: {
        twitter: "https://twitter.com/devnovate",
        github: "https://github.com/devnovate",
        website: "https://devnovate.com",
      },
    });

    console.log("🎉 Demo account created successfully!");
    console.log("📧 Email: demo@devnovate.com");
    console.log("🔑 Password: demo123");
    console.log("👤 Username: demo_user");
    console.log("📝 Bio: Demo account for testing");

    // Also create a demo admin account
    const adminExists = await User.findOne({ email: "admin@devnovate.com" });

    if (!adminExists) {
      const adminUser = await User.create({
        username: "admin_demo",
        email: "admin@devnovate.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "Demo",
        bio: "Demo admin account for testing administrative features.",
        role: "admin",
      });

      console.log("\n🔐 Demo admin account created!");
      console.log("📧 Email: admin@devnovate.com");
      console.log("🔑 Password: admin123");
      console.log("👤 Username: admin_demo");
    }
  } catch (error) {
    console.error("❌ Error creating demo account:", error.message);

    if (error.code === 11000) {
      console.log(
        "ℹ️  Demo account might already exist with different details"
      );
    }
  } finally {
    await mongoose.disconnect();
    console.log("\n📊 MongoDB disconnected");
    process.exit(0);
  }
};

// Run the script
console.log("🚀 Creating demo accounts...");
createDemoAccount();
