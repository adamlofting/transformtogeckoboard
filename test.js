var data = require('./lib/data.js');
var async = require('async');



async.series([
    function(callback){
        data.setKey("testKey", "abc123", function (err, res) {
          callback(null);
        });
    },
    function(callback){
        data.setKey("testKey2", "def456", function (err, res) {
          callback(null);
        });
    },
    function(callback){
        data.getKey("testKey2", function (err, res) {
          if (err) {
            console.log(err);
            return callback();
          }
          console.log(res);
          callback();
        });
    },
    function(callback){
        data.getKey("testKey", function (err, res) {
          if (err) {
            console.log(err);
            return callback();
          }
          console.log(res);
          callback();
        });
    }
],
// optional callback
function(err, results){
    console.log('done');
});





