var express = require("express");
var NodeCache = require( "node-cache" );

var myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
var app = express();


// https://developer.geckoboard.com/#number-and-secondary-stat
function numberAndSecondaryStat (number, text) {
  var output = {
    "item": [
      {
        "value": number,
        "text": text
      }
    ]
  };
  return output;
}

app.get('/makerparty/hosts', function(req, res) {
  var output = numberAndSecondaryStat(5, 'event hosts');
  res.json(output);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
