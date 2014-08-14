var mysql = require('mysql');

var connectionOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

if (process.env.DB_SSL) {
  // SSL is used for Amazon RDS, but not necessarily for local dev
  connectionOptions.ssl = process.env.DB_SSL;
}



exports.setKey = function setKey(key, value, callback) {
  var connection = mysql.createConnection(connectionOptions);
  connection.connect(function connectionAttempted(err) {

    if (err) {
      connection.end();
      console.error(err);
      return callback(err);
    }

    var entry = {
      key: key,
      value: value
    };

    // Using REPLACE INTO to avoid worrying about duplicate entries
    // There is a unique key set across all team + bucket + date + description
    connection.query('REPLACE INTO transformtogeckoboard SET ?', entry, function (err, result) {
      connection.end();
      if (err) {
        console.error(err);
        return callback(err);
      }
      return callback();
    });
  });
};


exports.getKey = function setKey(key, callback) {
  var connection = mysql.createConnection(connectionOptions);
  connection.connect(function connectionAttempted(err) {

    if (err) {
      connection.end();
      console.error(err);
      return callback(err);
    }

    // Using REPLACE INTO to avoid worrying about duplicate entries
    // There is a unique key set across all team + bucket + date + description
    var qry = connection.query('SELECT value FROM transformtogeckoboard WHERE transformtogeckoboard.key = ?', [key], function (err, result) {
      connection.end();
      if (err) {
        console.error(err);
        return callback(err);
      }
      var value = result[0].value;
      return callback(null, value);
    });
  });
};




