var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Krishna2",
    database: "mydb"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE item_relation (from_itemid int not null,to_itemid int not null" +
        ", traded int not null,from_email VARCHAR(255) not null,to_email VARCHAR(255) not null" +
        ",from_pic_url VARCHAR(2083) not null , to_pic_url VARCHAR(2083) not null"+
        ",from_item_name VARCHAR(255) not null , to_item_name VARCHAR(255) not null"+
        ",from_name VARCHAR(255) not null , to_name VARCHAR(255) not null"+
        " , primary key (from_itemid,to_itemid)," +
        " foreign key(from_itemid) references items(item_id)," +
        " foreign key(to_itemid) references items(item_id))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
});