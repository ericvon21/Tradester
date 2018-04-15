var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASS,
  database: "mydb"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE items (item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,CONSTRAINT f_email FOREIGN KEY (email))";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});