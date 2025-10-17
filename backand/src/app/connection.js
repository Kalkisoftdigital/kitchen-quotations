const mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST, // Your MySQL database host
    user: process.env.DB_USERNAME, // Your MySQL database username
    password: process.env.DB_PASSWORD, // Your MySQL database password
    database: process.env.DB_NAME // Your MySQL database name
  });

  connection.connect((err) => {
    if (err) {
    
      return;
    }
   
    // Your code to execute queries or perform operations after establishing connection
  });

  // Example query
connection.query('SELECT * FROM my_table', (error, results, fields) => {
    if (error) {

      return;
    }
    // Process query results here
   
  });
  
  // Don't forget to close the connection when you're done with it
  connection.end();