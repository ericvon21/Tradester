const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
var db = require('../tables/db');
var key=require('../config/key.js')




passport.serializeUser((user, done) => {
  //console.log('In searizlize  '+ user.email);
  //   done(null, user.email);
  done(null,user);
});

passport.deserializeUser((user, done) => {
    //  console.log('In desearizlize  '+ Object.values(email));
    // var sql_select='SELECT * from users where email=\''+email+'\'';
    // db.query(sql_select, function (err, result) {
    //     if(err)
    //       console.log('couldnt find user');
    //     console.log('desiralize res= '+result);
    //     done(null,result);
    // })
   // done(null,user);

   done(null,user);
});



passport.use(
    new GoogleStrategy({
      //var add_user=''
    	callbackURL:'/auth/google/redirect',
        clientID:key.google.clientID,
        clientSecret:key.google.clientSecret
    }, (accessToken,refreshToken,profile, done) => {
        console.log("heloo");
        console.log(profile);
        var sql_select='SELECT * from users where email=\''+profile.emails[0].value+'\'';
        var sql_insert='INSERT into users(email,fname,lname,profile_pic_url) VALUES (\''+profile.emails[0].value+'\',\''
        +profile.name.familyName+'\',\''+profile.name.givenName+'\',\''+profile.photos[0].value+'\')';
db.query(sql_select,function(err,user){
      if(err || user.length<1){
          console.log('user doesnt exist');
          db.query(sql_insert, function (err, result) {
          var newUser = new Object();
          if (err){
           // console.log(err);
           console.log('error inserting');
           return done(null,false);

          }
          else{
             newUser.email = result.email;
             newUser.fname = result.fname;
             newUser.lname = result.lname;
             newUser.profile_pic_url = result.profile_pic_url;
             console.log("record inserted");
             return done(null,newUser);

            // return done(null)
          }
        });
      }
      else{
         console.log('user exists');
          console.log(user);
         return done(null,user[0]);
      }

});

        // passport callback function
    })
);


passport.use(new FacebookStrategy({
    clientID: key.facebook.appID,
    clientSecret: key.facebook.appSecret,
    callbackURL: "https://google.com"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// keys.google.clientID,
 // keys.google.clientSecret
 //callbackURL: "http://localhost:3000/auth/facebook/callback"