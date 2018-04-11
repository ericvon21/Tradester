const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const key=require('./key');

passport.use(
    new GoogleStrategy({
    	callbackURL:'/auth/google/redirect',
        clientID:key.google.clientID,
        clientSecret:key.google.clientSecret
    }, () => {

        // passport callback function
    })
);


passport.use(new FacebookStrategy({
    clientID: key.facebook.appID,
    clientSecret: key.facebook.appSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// keys.google.clientID,
 // keys.google.clientSecret