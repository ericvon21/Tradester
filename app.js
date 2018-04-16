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
var db = require('./tables/db');



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
      var sql_select='SELECT * from items where not email =\''+req.user.email+'\'';
    console.log('select=  '+sql_select);
    db.query(sql_select,function(err,item){
        if(err)
        {
            console.log('some error in item');
        }
        else{
        console.log(item)
        res.render('Pages/newdashboard',{suggestion:suggestions[random_suggestion_num],user:req.user,item:item});
        }
    });

   
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
        var file_path='views/images/Trading_Images/'+file_name;
        file.mv(file_path, function(err){
            if (err) throw err;
        });
         var sql_insert='INSERT into items(email,description,item_name,is_trade,pic_url) VALUES (\''+req.user.email+'\',\''
        +description+'\',\''+item_name+'\','+ 0 +',\''+ file_path+'\')';
        db.query(sql_insert,function(err,user){
             if(err)
                console.log('error adding item');
            else
                console.log('inserted item');
        })

    }

    res.redirect('/profile');
});


app.post('/items_view.php',function(req,res){
    var sql_select='SELECT * from items where email=\''+req.user.email+'\'';
    console.log('select=  '+sql_select);
    db.query(sql_select,function(err,item){
        if(err)
        {
            console.log('some error in item');
            console.log(err);
        }
        console.log(Object.values(item));
        for(i=0;i<item.length;i++){
            console.log('item name='+item[i].item_name);
            console.log('item email='+item[i].email);
        }
        res.render('all_items',{item:item});
    });
});

app.listen(3000);
console.log('app now listening for requests on port 3000');
