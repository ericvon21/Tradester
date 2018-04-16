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
  var sql = "CREATE TABLE items (item_id int NOT NULL AUTO_INCREMENT,email VARCHAR(255),description VARCHAR(500),item_name VARCHAR(255),PRIMARY KEY (item_id),FOREIGN KEY (email) REFERENCES users(email), is_trade BIT)";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});