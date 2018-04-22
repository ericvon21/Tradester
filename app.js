var express = require('express');
var authRoutes = require('./routes/auth-routes');
var app = express();
var passportSetup=require('./config/passport-setup');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var path = require('path');
var random = require('random-int');
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
	console.log("profile user="+ req.user.email);
	if(!req.user){
		res.redirect('/');
	}
    var sql_query='SELECT * from items where email=\''+req.user.email+'\'';
    var sql_select='SELECT * from items,users where items.email=users.email and not items.email=\''+req.user.email+'\' ORDER BY item_id DESC';
    var random_suggestion_num = random(suggestions.length-1);
    var num_req = 0;

    db.query(sql_select,function(err,user_and_item){
      //  console.log(user_and_item);
        if(err)
        {
            console.log(err);
            res.render('Pages/newdashboard',{suggestion:suggestions[random_suggestion_num],user:req.user,feed:user_and_item});
            return;
        }
        db.query(sql_query,function(err,item){
            if(err) {
                console.log('some error in item');
                console.log(err);
                return;
            }
            num_req = item.length;
            res.render('Pages/newdashboard',{suggestion:suggestions[random_suggestion_num],user:req.user,feed:user_and_item,pending_req :num_req});

        });



    //    if (item.length == 0) console.log(item);
        // for(i=0;i<item.length;i++){
        //     console.log('item name='+item[i].item_name);
        //     console.log('item email='+item[i].email);
        // }
      //  res.render('Pages/newdashboard',{suggestion:suggestions[random_suggestion_num],user:req.user});
    });



});

app.get('/item',function(req,res){
   console.log(req.body.item_item);
   res.send(req.body.trade_item);
});


app.post('/action_page.php',function(req,res){
    var item_name = req.body.item_name;
    var description = req.body.description;

    if(req.files.img == undefined)
    {
        res.render('Pages/errorpage',{user:req.user, perror:"Image Invalid, Please use a valid image"});
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
        console.log(sql_insert);
         db.query(sql_insert,function(err,user){
             if(err)
                console.log('error adding item');
            else
                console.log('inserted item');
        })

    }

    res.redirect('/profile');
});



app.get('/delete_item', function(req,res){
    res.render('Pages/errorpage',{user:req.user, perror:"Please Implement Delete Item First"})
});

app.get('/trade_item',function(req,res){
    var item_id = req.query.trade_item;
    var item_query = 'UPDATE items SET is_trade = 1 WHERE item_id ='+item_id;
    console.log(item_query);

    db.query(item_query,function(err,item){
        if(err)
        {
            console.log('some error in item');
            console.log(err);
        }
        console.log(item);
        res.render('Pages/errorpage',{user:req.user, perror:"Please Implement Trade Item first"});
    });

});

app.get('/search',function(req,res){
    var search_query = req.query.search;
    var regex = "^.*"+ search_query +".*$";

    var sql_select='SELECT * from items where item_name=\''+search_query + '\'';
    console.log('select=  '+sql_select);
    db.query(sql_select,function(err,item){
        if(err)
        {
            console.log('some error in item');
            console.log(err);
            res.send("Could not query, Something went wrong");
            return;
        }
        console.log(item);
        if (item.length == 0){
            res.render('Pages/errorpage',{user:req.user, perror:"No Items Found"});
            return;
        }
        res.render('Pages/all_items',{item:item,user:req.user,search:true});
    });


});

app.post('/items_view',function(req,res){
    console.log(req.user);
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
        if (item.length==0){
            res.render('Pages/errorpage',{user:req.user, perror:"You have no Items yet :( ...  Start by adding items!"});
            return;
        }
        res.render('Pages/all_items',{item:item,user:req.user,search:false});
    });
});

app.get('*', function(req, res) {
    res.redirect('/');
});




app.listen(3000);
console.log('app now listening for requests on port 3000');
