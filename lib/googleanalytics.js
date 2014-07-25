var readline = require('readline');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var analytics = google.analytics('v3');

var CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// var url = oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   scope: 'https://www.googleapis.com/auth/analytics'
// });

// console.log(url);


function getAccessToken(oauth2Client, callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will returntoken
    scope: 'https://www.googleapis.com/auth/analytics' // can be a space-delimited string or an array of scopes
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', function(code) {
    // request access token
    oauth2Client.getToken(code, function(err, tokens) {
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
      oauth2Client.setCredentials(tokens);
      callback();
    });
  });
}

// retrieve an access token
getAccessToken(oauth2Client, function() {

  analytics.data.ga.get( {
    auth: oauth2Client,
    "ids": process.env.GA_VIEW_ID,
    "start-date": "30daysAgo",
    "end-date": "today",
    "metrics": "ga:sessions"
  },
  function (err, response) {
    if (err) {
      console.log('An error occured', err);
      return;
    }

    console.log(response);
  });
});
