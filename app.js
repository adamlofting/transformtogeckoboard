var express = require('express');
var makerparty = require('./lib/makerparty');
var appmaker = require('./lib/appmaker');

var app = express();

/**
 * ROUTES
 */

// MAKER PARTY
var mp_hosts = '/makerparty/hosts';
app.get(mp_hosts, function(req, res) {
  makerparty.singleNumber(res, mp_hosts, 'hosts');
});

var mp_attendees = '/makerparty/attendees';
app.get(mp_attendees, function(req, res) {
  makerparty.singleNumber(res, mp_attendees, 'estimatedAttendees');
});

var mp_events = '/makerparty/events';
app.get(mp_events, function(req, res) {
  makerparty.singleNumber(res, mp_events, 'events');
});

var mp_countries = '/makerparty/countries';
app.get(mp_countries, function(req, res) {
  makerparty.singleNumber(res, mp_countries, 'countries');
});

var mp_cities = '/makerparty/cities';
app.get(mp_cities, function(req, res) {
  makerparty.singleNumber(res, mp_cities, 'cities');
});

var mp_mentors = '/makerparty/mentors';
app.get(mp_mentors, function(req, res) {
  makerparty.singleNumber(res, mp_mentors, 'mentors');
});

var mp_coorganizers = '/makerparty/coorganizers';
app.get(mp_coorganizers, function(req, res) {
  makerparty.singleNumber(res, mp_coorganizers, 'coorganizers');
});

// APPMAKER
app.get('/appmaker/mostactiveusers', function(req, res) {
  appmaker.mostActiveUsers(res);
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


// Periodically update the Appmaker Stats
var UPDATE_FREQUENCY_MINS = 10;
setInterval(appmaker.refreshStats, UPDATE_FREQUENCY_MINS * 60 * 1000);
// Run this once right away
appmaker.refreshStats();
