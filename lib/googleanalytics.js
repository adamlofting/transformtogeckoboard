var fs = require('fs');
var async = require('async');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var analytics = google.analytics('v3');
var data = require('./data.js');
var backfill = require('./backfill.js');

var CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

/**
 * APPMAKER
 */

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

/**
 * EOY
 */

function getEOYDonationsByCountry (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID_EOY,
    "start-date": "2014-11-01",
    "end-date": "2015-01-14",
    "dimensions": "ga:country",
    "metrics": "ga:itemRevenue",
    "sort":"-ga:itemRevenue",
    "max-results":"300"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    var output = [];
    for (var i = 0; i < response.rows.length; i++) {
      output.push({
        "country":response.rows[i][0],
        "eoyDonations":response.rows[i][1]
      });
    }

    fs.writeFileSync( './generated/eoy-donations-by-country.json', JSON.stringify( output ) );
    callback();
  });
}

function getEOYDonationsByContinent (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID_EOY,
    "start-date": "2014-11-01",
    "end-date": "2015-01-14",
    "dimensions": "ga:continent",
    "metrics": "ga:itemRevenue",
    "sort":"-ga:itemRevenue",
    "max-results":"20"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    var output = [];
    for (var i = 0; i < response.rows.length; i++) {
      output.push({
        "continent":response.rows[i][0],
        "eoyDonations":response.rows[i][1]
      });
    }

    fs.writeFileSync( './generated/eoy-donations-by-continent.json', JSON.stringify( output ) );
    callback();
  });
}

function getEOYDonationsBySource (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID_EOY,
    "start-date": "2014-11-01",
    "end-date": "2015-01-14",
    "dimensions": "ga:medium",
    "metrics": "ga:itemRevenue",
    "sort":"-ga:itemRevenue",
    "max-results":"50"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    var output = [];
    for (var i = 0; i < response.rows.length; i++) {
      output.push({
        "source":response.rows[i][0],
        "eoyDonations":response.rows[i][1]
      });
    }

    fs.writeFileSync( './generated/eoy-donations-by-source.json', JSON.stringify( output ) );
    callback();
  });
}

function addOrInsertToBackfill (backfill, row) {
  var countryToCheck = row[0];
  var countToAdd = parseInt(row[1]);
  var matched = false;
  for (var i = 0; i < backfill.length; i++) {
    if (backfill[i].country && backfill[i].country === countryToCheck) {
      //cast to int
      var newAmount = parseInt(backfill[i].eoyDonations) + countToAdd;
      backfill[i].eoyDonations = newAmount.toString();
      matched = true;
    }
  }

  if (!matched) {
    backfill.push({
      "country":row[0],
      "eoyDonations":row[1]
    });
  }
  // console.log(backfill);
  return backfill;
}

function compareDonations(a,b) {
  if (parseInt(a.eoyDonations) < parseInt(b.eoyDonations))
     return 1;
  if (parseInt(a.eoyDonations) > parseInt(b.eoyDonations))
    return -1;
  return 0;
}

function getEOYTransactionsByCountry (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID_EOY,
    "start-date": "2014-11-01",
    "end-date": "2015-01-14",
    "dimensions": "ga:country",
    "metrics": "ga:transactions",
    "sort":"-ga:transactions",
    "max-results":"300"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    var output = backfill.eoy;
    for (var i = 0; i < response.rows.length; i++) {
      output = addOrInsertToBackfill(output, response.rows[i]);
    }
    output.sort(compareDonations);

    fs.writeFileSync( './generated/eoy-transactions-by-country.json', JSON.stringify( output ) );
    callback();
  });
}

function getEOYTransactionsByContinent (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID_EOY,
    "start-date": "2014-11-01",
    "end-date": "2015-01-14",
    "dimensions": "ga:continent",
    "metrics": "ga:transactions",
    "sort":"-ga:transactions",
    "max-results":"20"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    var output = [];
    for (var i = 0; i < response.rows.length; i++) {
      output.push({
        "continent":response.rows[i][0],
        "eoyDonations":response.rows[i][1]
      });
    }

    fs.writeFileSync( './generated/eoy-transactions-by-continent.json', JSON.stringify( output ) );
    callback();
  });
}

function getEOYTransactionsBySource (callback) {
  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID_EOY,
    "start-date": "2014-11-01",
    "end-date": "2015-01-14",
    "dimensions": "ga:sourceMedium",
    "metrics": "ga:transactions",
    "sort":"-ga:transactions",
    "max-results":"50"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return callback(err);
    }
    // predefine some categories we want to report
    var output = [
      {"source":"Snippet", "eoyDonations": 0},
      {"source":"Email", "eoyDonations": 0},
      {"source":"Mozilla.org", "eoyDonations": 0},
      {"source":"Organic", "eoyDonations": 0},
      {"source":"Directory Tiles", "eoyDonations": 0},
      {"source":"Twitter & Facebook", "eoyDonations": 0},
      {"source":"Other Referral", "eoyDonations": 0},
    ];

    function addToKey (key, value) {
      for (var i = 0; i < output.length; i++) {
        if (output[i].source == key) {
          output[i].eoyDonations = output[i].eoyDonations + parseInt(value);
        }
      }
    }

    for (var i = 0; i < response.rows.length; i++) {
      var sourceMedium = response.rows[i][0].toLowerCase();
      var val = response.rows[i][1];
      if (sourceMedium.indexOf("snippet") != -1) {
        addToKey("Snippet", val);
      }
      else if (sourceMedium.indexOf("email") != -1) {
        addToKey("Email", val);
      }
      else if (sourceMedium.indexOf("mozilla") != -1) {
        addToKey("Mozilla.org", val);
      }
      else if (sourceMedium.indexOf("organic") != -1) {
        addToKey("Organic", val);
      }
      else if (sourceMedium.indexOf("directory-tiles") != -1) {
        addToKey("Directory Tiles", val);
      }
      else if (sourceMedium.indexOf("twitter") != -1) {
        addToKey("Twitter & Facebook", val);
      }
      else if (sourceMedium.indexOf("facebook") != -1) {
        addToKey("Twitter & Facebook", val);
      }
      else {
        //console.log('not allocated:', response.rows[i][0], response.rows[i][1]);
        addToKey("Other Referral", val);
      }
    }

    // convert the ints to strings, because that's how the old version worked
    for (var i = 0; i < output.length; i++) {
      output[i].eoyDonations = "" + output[i].eoyDonations;
    }

    console.log(output);

    fs.writeFileSync( './generated/eoy-transactions-by-source.json', JSON.stringify( output ) );
    callback();
  });
}

/**
 * AUTH & GENERAL WORKFLOW
 */

function pingTheAPI (callback) {
  console.log('called pingTheAPI');
  async.parallel([
    getTotalEvents,
    getTopBricks,
    getTopRemixes,
    getEOYDonationsByCountry,
    getEOYDonationsByContinent,
    getEOYDonationsBySource,
    getEOYTransactionsByCountry,
    getEOYTransactionsByContinent,
    getEOYTransactionsBySource
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
        pingTheAPI(function (err, res) {
          if (err) {
            console.log('Error', err);
            return;
          }
          return;
        });
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
