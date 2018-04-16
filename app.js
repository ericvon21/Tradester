var express = require('express');
var authRoutes = require('./routes/auth-routes');
var app = express();
var passportSetup=require('./config/passport-setup');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var path = require('path');
var random = require('random-int')
const cookieSession = require('cookie-session');
const passport=require('passport');




app.use(cookieSession({
	maxAge:24*60*60*60,
	keys:['abc']
}));


// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// set view engine
app.set('view engine', 'ejs');


// set up routes
app.use('/auth', authRoutes);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '')));
app.use( express.static( "Public" ) );
app.use(fileUpload());

var suggestions = ["Did you know that now you can trade items with your friends?",
                    "Wish List is now available",
                    "Add Items to your wish list and keep track of what you need",
                    "Want to trade something? Get started by Adding an Item",
                    "Tradester now allows pictures for trading objects",
                    "Be on the lookout for more updates soon to come"];


// create home route
app.get('/',function (req, res) {
	if(req.user)
		res.redirect('/profile');
	else
    	res.render('homepage');
});

app.get('/dashboard', function (req,res){
    res.render('dashboard');
});

app.get('/profile',function(req,res){
	//console.log("profile user="+Object.values(req.user));
	if(!req.user){
		res.redirect('/');
	}
    var random_suggestion_num = random(suggestions.length-1);


   res.render('Pages/newdashboard',{suggestion:suggestions[random_suggestion_num],user:req.user});
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
