var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sql123",
  database: "mydb"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE users (email VARCHAR(255) unique not null, fname VARCHAR(255),lname VARCHAR(255), profile_pic_url VARCHAR(2083) )";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});