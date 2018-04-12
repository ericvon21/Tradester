const router = require('express').Router();
const passport=require('passport');

// auth login
router.get('/login', function (req, res) {
    res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', function(req, res) {
    // handle with passport
    res.send('logging out');
});

// auth with google+
router.get('/google',passport.authenticate('google',{
		scope:['profile']
}));

router.get('/facebook',
  passport.authenticate('facebook'));

module.exports = router;