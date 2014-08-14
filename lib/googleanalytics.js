var fs = require('fs');
var async = require('async');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var analytics = google.analytics('v3');
var data = require('./data.js');

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


function getAuthURL(callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/analytics' // can be a space-delimited string or an array of scopes
  });

  callback(null, url);
}

function updateAuthTokens(code, callback) {
  oauth2Client.getToken(code, function(err, tokens) {
    // set tokens to the client
    oauth2Client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      return callback();
    }
    // save the refresh toke to the DB
    data.setKey('gaRefreshToken', tokens.refresh_token, function (err, res) {
      return callback();
    });
  });
}

function getLatestData() {
  console.log( '[%s] Updating GA Stats', Date());

  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    // try and auth
    data.getKey('gaRefreshToken', function (err, res) {
      if (err) {
        console.log(err);
        return;
      }
      var tokens = {
        access_token: 'none',
        refresh_token: res
      };
      oauth2Client.setCredentials(tokens);
      oauth2Client.refreshAccessToken(function (err, res) {
        if (err) {
          console.log(err);
          return;
        }
        return;
      });
    });
  } else {
    pingTheAPI(function (err, res) {
      if (err) {
        console.log('Error', err);
        return;
      }
      return;
    });
  }

  console.log( '[%s] Finished Updating GA Stats', Date());
}

module.exports = {
  getAuthURL:getAuthURL,
  updateAuthTokens:updateAuthTokens,
  getLatestData:getLatestData
};
