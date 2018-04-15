const express = require('express');
const authRoutes = require('./routes/auth-routes');
const app = express();
const passportSetup=require('./config/passport-setup');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var path = require('path');


// set view engine
app.set('view engine', 'ejs');

// set up routes
app.use('/auth', authRoutes);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '')));
app.use(fileUpload());


// create home route
app.get('/',function (req, res) {
    res.render('homepage');
});

app.get('/dashboard', function (req,res){
    res.render('dashboard');
});


app.post('/action_page.php',function(req,res){
    var item_name = req.body.item_name;
    var description = req.body.description;

    if(req.files.img == undefined)
    {
        res.send("File was not found");
        return;
    }else {
        console.log(req.files.img.name);
        var file = req.files.img;
        var file_name = file.name;
        file.mv('views/images/Trading_Images/'+file_name, function(err){
            if (err) throw err;
        });
    }

    res.send("Item name: " + item_name+ " Description:" + description);
});

app.listen(3000);
console.log('app now listening for requests on port 3000');
