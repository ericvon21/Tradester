const express = require('express');
const authRoutes = require('./routes/auth-routes');
var path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, '')));
//const passportSetup=require('./config/passport-setup');

// set view engine
app.set('view engine', 'ejs');

// set up routes
app.use('/auth', authRoutes);

// create home route
app.get('/',function (req, res) {
    res.render('home');
});

app.get('/dashboard', function (req,res){
    res.render('dashboard');
});

app.listen(3000);
console.log('app now listening for requests on port 3000');
