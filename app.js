var express = require("express");
var request = require('request');
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

function getFromMakerParty (fieldName, callback) {
  var mpEventsURL = 'http://party.webmaker.org/event-stats';

  request(mpEventsURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // response was successful, so parse the JSON
      var mpStats = JSON.parse(body);
      // try and get the requested field from the body
      if (mpStats[fieldName]) {
        return callback(mpStats[fieldName]);
      }
      return callback('Missing field');
    } else {
      callback('Error');
    }
  });
}

function makerPartySingleNumber (res, key, fieldName) {
  var cached = myCache.get(key);
  if (cached[key]) {
    // this was already saved in the cache
    res.json (cached[key]);
  } else {
    // we need to fetch this from makerparty data
    getFromMakerParty(fieldName, function (result) {
      var output = numberAndSecondaryStat(result, fieldName);
      // save this to cache for quicker round trip next time
      myCache.set (key, output);
      res.json(output);
    });
  }
}

/**
 * ROUTES
 */

// MAKER PARTY HOSTS
var mp_hosts = '/makerparty/hosts';
app.get(mp_hosts, function(req, res) {
  makerPartySingleNumber(res, mp_hosts, 'hosts');
});

var mp_attendees = '/makerparty/attendees';
app.get(mp_attendees, function(req, res) {
  makerPartySingleNumber(res, mp_attendees, 'attendees');
});

var mp_events = '/makerparty/events';
app.get(mp_events, function(req, res) {
  makerPartySingleNumber(res, mp_events, 'events');
});

var mp_countries = '/makerparty/countries';
app.get(mp_countries, function(req, res) {
  makerPartySingleNumber(res, mp_countries, 'countries');
});

var mp_cities = '/makerparty/cities';
app.get(mp_cities, function(req, res) {
  makerPartySingleNumber(res, mp_cities, 'cities');
});

var mp_mentors = '/makerparty/mentors';
app.get(mp_mentors, function(req, res) {
  makerPartySingleNumber(res, mp_mentors, 'mentors');
});

var mp_coorganizers = '/makerparty/coorganizers';
app.get(mp_coorganizers, function(req, res) {
  makerPartySingleNumber(res, mp_coorganizers, 'coorganizers');
});




var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
