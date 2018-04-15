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
  var sql = "CREATE TABLE items (item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,CONSTRAINT email FOREIGN KEY (email),description varchar(500),item_name VARCHAR(255),is_trade BIT)";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});