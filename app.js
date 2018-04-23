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



function noticheck(req,cb){
    var query = "select * from item_relation where to_email=\"" +req.user.email+"\"";
    var query2 ="SELECT * FROM mydb.users where email=";
    var i;

    db.query(query,function (err,result) {
        if (err){
            console.log(err);
        }else if (result.length>0) {
            for (i = 0; i <result.length-1; i++) {
                query2 += "\"" + result[i].from_email + "\" or email=";
            }
            query2 += "\"" + result[result.length-1].from_email + "\"";
            db.query(query2,function (err,result1) {
                if (err){
                    console.log(err);
                }else{
                    var z = JSON.parse(JSON.stringify(result1));
                }
                cb(result.length,z);
            })
        }else {
            cb(0,null);
        }
    });

}

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
	if(!req.user){
		res.redirect('/');
	}
    var sql_query='SELECT * from items where email=\''+req.user.email+'\'';
    var sql_select='SELECT * from items,users where items.email=users.email and not items.email=\''+req.user.email+'\' ORDER BY item_id DESC';
    var random_suggestion_num = random(suggestions.length-1);
    var num_req = 0;

    db.query(sql_select,function(err,user_and_item){
        if(err)
        {
            console.log(err);
            noticheck(req,function(result,z){
                res.render('Pages/newdashboard',{suggestion:suggestions[random_suggestion_num],notification:result, requser:z,user:req.user,feed:user_and_item});
            });
            return;
        }
        db.query(sql_query,function(err,item){
            if(err) {
                console.log('some error in item');
                console.log(err);
                return;
            }
            num_req = item.length;
            noticheck(req,function(result,z){
                res.render('Pages/newdashboard',{suggestion:suggestions[random_suggestion_num],notification:result, requser:z,user:req.user,feed:user_and_item,pending_req :num_req});
            });
        });
    });



});

app.get('/item',function(req,res){

    noticheck(req,function(result,z){
        res.render('Pages/errorpage',{user:req.user,notification:result.length, requser:z, perror:"Please Implement Trade Item first"});
    });

   //console.log(req.body.item_item);
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
    var from_name;
    var from_item_id = 11;
    var from_email;
    var from_pic_url;
    var from_item_name;

    var to_name;
    var to_email;
    var to_item_id = 20;
    var to_pic_url;
    var to_item_name;

    var from_query1 = "select * from items where item_id="+ from_item_id;
    var from_query2 = "select * from users where email=\"";
    var to_query1 = "select * from items where item_id="+ to_item_id;
    var to_query2 = "select * from users where email=\"";

    db.query(from_query1,function(err,from_info){
        from_email = from_info[0].email;
        from_pic_url = from_info[0].pic_url;
        from_item_name = from_info[0].item_name;
        from_query2 += from_email + "\"";

        db.query(from_query2,function(err,from_info2){
            from_name = from_info2[0].lname;

            db.query(to_query1,function(err,to_info){
                to_email = to_info[0].email;
                to_pic_url = to_info[0].pic_url;
                to_item_name = to_info[0].item_name;
                to_query2 += to_email + "\"";

                db.query(to_query2,function (err, to_info2) {
                    to_name = to_info2[0].lname;

                    var query = "insert into item_relation(from_itemid,to_itemid,from_email,to_email,traded,from_pic_url,to_pic_url,from_name,to_name,from_item_name,to_item_name)" +
                        " values ("+ from_item_id + "," + to_item_id + ",\"" +from_email+"\",\""+to_email+"\",0,\"" +from_pic_url+"\",\""+to_pic_url+"\",\"" +
                        from_name+ "\",\""+ to_name+"\",\""+from_item_name+ "\",\""+ to_item_name+"\")";
                    console.log(query);
                    return;
                })
            });






        })

    });

    return;

    db.query(query,function(err,item){
        if(err)
        {
            console.log('some error in item');
            console.log(err);
        }
        console.log(item);
      //  res.render('Pages/errorpage',{user:req.user, perror:"Please Implement Trade Item first"});
    });

});

app.get('/search',function(req,res){
    var search_query = req.query.search;
    var search_tokens=search_query.split(" ");
    var where='';
    var tokens_size=search_tokens.length;
    var i;
    for (i = 0; i <tokens_size-1; i++) {
        where='item_name REGEXP\''+search_tokens[i]+'\' and ';
    }

    where+='item_name REGEXP\''+search_tokens[tokens_size-1]+'\'';
    var sql_select='SELECT * from items where '+where + ' and not email=\''+ req.user.email +' \'';
    console.log('sql search= '+sql_select);

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
   // console.log(req.user);
    var sql_select='SELECT * from items where email=\''+req.user.email+'\'';
   // console.log('select=  '+sql_select);
    db.query(sql_select,function(err,item){
        if(err)
        {
            console.log('some error in item');
            console.log(err);
        }
       // console.log(Object.values(item));
        for(i=0;i<item.length;i++){
            //console.log('item name='+item[i].item_name);
            //console.log('item email='+item[i].email);
        }
        if (item.length==0){
            res.render('Pages/errorpage',{user:req.user, perror:"You have no Items yet :( ...  Start by adding items!"});
            return;
        }
        noticheck(req,function(result,z){
            res.render('Pages/all_items',{item:item,user:req.user,search:false,notification:result.length, requser:z});
        });
    });
});

app.get('/trade_page',function(req,res){
    // var query ="select * from mydb.item_relation,mydb.items,mydb.users where item_relation.from_itemid=items.item_id and item_relation.to_email=\""+ req.user.email+"\" and  users.email=\""+ req.user.email+"\""
    // var query1 ="select * from mydb.item_relation,mydb.items,mydb.users where item_relation.to_itemid=items.item_id and item_relation.to_email=\""+ req.user.email+"\" and  users.email=\""+ req.user.email+"\""

    var query = "SELECT * FROM mydb.item_relation where to_email=\"" + req.user.email+"\"";
    db.query(query,function(err,result1){
       if (err){
           console.log(err);
       }else {
           noticheck(req,function(result,z){
               res.render('Pages/trade_page',{user:req.user,notification:result.length ,trade_items:result1 , requser:z});
           });


           // db.query(query1,function(err,result1) {
           //     if (err){
           //         console.log(err);
           //     }else {
           //
           //         noticheck(req,function(result,z){
           //             res.render('Pages/trade_page',{user:req.user,notification:result.length, requser:z, perror:"Please Implement Trade Item first"});
           //         });
           //     }
           //
           //
           // });

           }
    });


});

app.get('*', function(req, res) {
    res.redirect('/');
});




app.listen(3000);
console.log('app now listening for requests on port 3000');
