// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });
      // If user does not exist, create a new record (registration via Google)
      if (!user) {
         user = new User({
            name: profile.displayName,
            email,
            password: '',  // Not needed for Google OAuth users
            type: 'student'
         });
         await user.save();
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Serialize and deserialize (if you want to support sessions; otherwise these are optional)
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
