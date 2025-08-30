const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists with same email, link Google account
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // Create new user
        // Generate a safe username (max 20 characters)
        const baseUsername = profile.emails[0].value.split("@")[0];
        const randomSuffix = Math.random().toString(36).substring(2, 8); // 6 random characters
        let username =
          baseUsername.length > 13
            ? baseUsername.substring(0, 13) + randomSuffix
            : baseUsername + randomSuffix;

        // Ensure username is unique
        let existingUser = await User.findOne({ username });
        let counter = 1;
        while (existingUser) {
          const suffix = counter.toString();
          username = username.substring(0, 20 - suffix.length) + suffix;
          existingUser = await User.findOne({ username });
          counter++;
        }

        const newUser = new User({
          googleId: profile.id,
          username: username,
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0].value,
          isActive: true,
          role: "user",
          bio: "",
          socialLinks: {
            twitter: "",
            linkedin: "",
            github: "",
            website: "",
          },
          stats: {
            totalBlogs: 0,
            totalLikes: 0,
            totalViews: 0,
            followersCount: 0,
            followingCount: 0,
          },
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
