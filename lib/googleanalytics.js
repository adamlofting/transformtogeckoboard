var fs = require('fs');
var async = require('async');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var analytics = google.analytics('v3');

var CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


function getTotalEvents (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID,
    "start-date": "30daysAgo",
    "end-date": "today",
    "metrics": "ga:totalEvents",
    "dimensions": "ga:eventAction",
    "filters": "ga:eventCategory==apps.webmaker.org",
    "sort":"-ga:totalEvents"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    var output = [];
    for (var i = 0; i < response.rows.length; i++) {
      output.push({
        "eventName":response.rows[i][0],
        "eventCount":response.rows[i][1]
      });
    }

    fs.writeFileSync( './generated/appmaker-top-events.json', JSON.stringify( output ) );
    callback();
  });
}


function getTopBricks (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID,
    "start-date": "30daysAgo",
    "end-date": "today",
    "metrics": "ga:totalEvents",
    "dimensions": "ga:eventLabel",
    "filters": "ga:eventCategory==apps.webmaker.org;ga:eventAction==Added Component",
    "sort":"-ga:totalEvents"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    var output = [];
    for (var i = 0; i < response.rows.length; i++) {
      if (i < 20) {
        output.push({
          "brickName":response.rows[i][0],
          "usageCount":response.rows[i][1]
        });
      }
    }

    fs.writeFileSync( './generated/appmaker-top-bricks.json', JSON.stringify( output ) );
    callback();
  });
}

function extractAppNameFromRemixURL (s) {
  var i = s.indexOf('?remix=');
  s = s.slice(i);
  s = s.replace('?remix=', '');
  s = s.replace('.appalot.me/index.html', '');
  return s;
}

function getTopRemixes (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID,
    "start-date": "30daysAgo",
    "end-date": "today",
    "metrics": "ga:uniquePageviews",
    "dimensions": "ga:pagePath",
    "filters": "ga:pagePath=~/designer\\?remix\\=",
    "sort":"-ga:uniquePageviews"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    var output = [];
    for (var i = 0; i < response.rows.length; i++) {
      output.push({
        "appName":extractAppNameFromRemixURL(response.rows[i][0]),
        "remixClickCount":response.rows[i][1]
      });
    }

    fs.writeFileSync( './generated/appmaker-most-remixed.json', JSON.stringify( output ) );
    callback();
  });
}


function pingTheAPI (callback) {
  console.log('called pingTheAPI');
  async.parallel([
    getTotalEvents,
    getTopBricks,
    getTopRemixes
  ],
  function(err, results) {
      if (err) {
        console.log('Error:', err);
      }
      callback();
  });
}


function getAccessToken(callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/analytics' // can be a space-delimited string or an array of scopes
  });

  console.log(url);

  callback(null, url);
}

function getLatestData(code, callback) {

  // request access token
  oauth2Client.getToken(code, function(err, tokens) {
    // set tokens to the client
    console.log(tokens);
    console.log('credentials pre setting:', oauth2Client.credentials);
    oauth2Client.setCredentials(tokens);
    console.log('credentials after setting:', oauth2Client.credentials);
    pingTheAPI(function (err, res) {
      if (err) {
        console.log('Error', err);
        return callback(err);
      }
      console.log('setting interval');
      setInterval(function () {
        pingTheAPI(function (err) {
          console.log('Pinged GA API via setInterval');
        });
      }, process.env.UPDATE_FREQUENCY_MINS * 60 * 1000);
      callback(null, res);
    });
  });
}

module.exports = {
  getAccessToken:getAccessToken,
  getLatestData:getLatestData
};
