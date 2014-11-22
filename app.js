var express = require('express');
var makerparty = require('./lib/makerparty');
var appmaker = require('./lib/appmaker');
var eoy = require('./lib/eoy');
var ga = require('./lib/googleanalytics');
var auth = require('http-auth');

var app = express();

/**
 * ROUTES
 */

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

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

app.get('/appmaker/topevents', function(req, res) {
  appmaker.topEvents(res);
});

app.get('/appmaker/topbricks', function(req, res) {
  appmaker.topBricks(res);
});

app.get('/appmaker/topremixes', function(req, res) {
  appmaker.topRemixes(res);
});

// EOY
app.get('/eoy/donationsbycountry', function(req, res) {
  eoy.EOYDonationsByCountry(res);
});

app.get('/eoy/donationsbycontinent', function(req, res) {
  eoy.EOYDonationsByContinent(res);
});

app.get('/eoy/donationsbysource', function(req, res) {
  eoy.EOYDonationsBySource(res);
});

app.get('/eoy/transactionsbycountry', function(req, res) {
  eoy.EOYTransactionsByCountry(res);
});

app.get('/eoy/transactionsbycontinent', function(req, res) {
  eoy.EOYTransactionsByContinent(res);
});

app.get('/eoy/transactionsbysource', function(req, res) {
  eoy.EOYTransactionsBySource(res);
});



// AUTH LOCAL
var basic = auth.basic({
        realm: "Web."
    }, function (username, password, callback) { // Custom authentication method.
        callback(username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD);
    }
);

// while there's no homepage, redirect to this
app.get('/', function (req, res) {
  res.redirect('/ga/auth');
});

// GA AUTH
app.get('/ga/auth', auth.connect(basic), function (req, res) {
  ga.getAuthURL(function (err, url) {
    res.redirect(url);
  });
});

app.get('/ga/oauth2callback', auth.connect(basic), function (req, res) {
  var code = req.param('code');
  if (!code) {
    res.json({'Error':'Missing authentication code from GA redirect'});
    return;
  }

  ga.updateAuthTokens(code, function (err, response) {
    if (err) {
      res.json({"Error": err});
      return;
    }
    console.log('Updated Auth Tokens');
    ga.getLatestData();
    res.redirect('/ga/done');
  });
});

app.get('/ga/done', auth.connect(basic), function (req, res) {
  res.send('Done<br><a href="/ga/auth/">Again</a>');
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


// Periodically update the Appmaker MakeAPI Stats
setInterval(appmaker.refreshStats, process.env.UPDATE_FREQUENCY_MINS * 60 * 1000);
// Run this once right away
appmaker.refreshStats();
// Periodically update the GA Stats
setInterval(ga.getLatestData, process.env.UPDATE_FREQUENCY_MINS * 60 * 1000);
ga.getLatestData();
