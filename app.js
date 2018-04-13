const express = require('express');
const authRoutes = require('./routes/auth-routes');
var path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, '')));
const passportSetup=require('./config/passport-setup');

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

app.get('/action_page.php',function(req,res){
    var item_name = req.query.item_name;
    var description = req.query.description;
    res.send("Item name: " + item_name+ " Description:" + description)
});

app.listen(3000);
console.log('app now listening for requests on port 3000');
