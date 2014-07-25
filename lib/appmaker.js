var fs = require('fs');
var async = require('async');
var geckoboard = require('../lib/geckoboard');
var makeapi = new require('makeapi-client')({
  apiURL: 'https://makeapi.webmaker.org'
});

function mostActiveUsers (res) {
  try {
    mostActive = fs.readFileSync( './generated/appmaker-author-stats.json', 'utf-8' );
    mostActive = JSON.parse( mostActive );

    var output = geckoboard.funnel(mostActive, 'appCount', 'username');
    res.json( output );
  }
  catch ( e ) {
    console.log(e);
    res.status( 503 ).json( { "error" : "Failed to load from file" } );
  }
}

function refreshStats () {
  console.log( '[%s] Updating Appmaker Stats', Date());

  var PER_PAGE = 250;
  var LAST_X_DAYS = 30;

  var today = new Date();
  var oldestDateWeCareAbout = new Date().setDate(today.getDate()-LAST_X_DAYS);

  var authors = [];
  var count = 0;
  var ignored = 0;
  var page = 1;
  var done = false;

  function checkPage (pageNumber, callback) {

    makeapi
      // define the search
      .contentType( "Appmaker" )
      .limit(PER_PAGE)
      .sortByField( "updatedAt", "desc" )
      //.getRemixCounts()
      .page(pageNumber)
      // then execute this search
      .then(function( err, makes ) {
        if( err ) {
          return callback(err);
        }

        // there are no further results
        if (makes.length === 0) {
          done = true;
          return callback(null);
        }

        // process each of the makes returned on this page
        async.each(makes,

          function processEach (make, callback) {
            var updatedAt = new Date(make.updatedAt);

            if (updatedAt > oldestDateWeCareAbout) {
              // check if we've already seen this author
              var pos = authors.map(function(e) { return e.username; }).indexOf(make.username);
              if (pos === -1) {
                // this is a new author
                var author = {
                  username: make.username,
                  appCount: 1
                };
                authors.push(author);
              } else {
                // this is an existing author
                authors[pos].appCount += 1;
              }
              count += 1;
            } else {
              // as the results are sorted on 'updatedAt',
              // we can stop looking through further pages
              done = true;
              ignored += 1;
            }
            callback();
          },

          function processingPageDone (err) {
            if (err) {
              console.log('Error processing Makes on page:', page);
            }
            callback(null);
          });
      });
  }

  async.until(
    function () {
      return done;
    },

    function checkNextPage (callback) {
      checkPage(page, function (err) {
        page += 1;
        callback();
      });
    },

    function finishedCheckingPages (err) {
      if (err) {
        console.log(err);
      }

      authors.sort(function (a,b) {
        return b.appCount - a.appCount;
      });

      console.log('Count', count);

      // save the results
      fs.writeFileSync( './generated/appmaker-author-stats.json', JSON.stringify( authors ) );

      console.log( '[%s] Finished Updating Appmaker Stats', Date());
    }
  );
}

module.exports = {
  refreshStats: refreshStats,
  mostActiveUsers: mostActiveUsers
};

// Sample App Data
// {
//   "appTags":[],
//   "userTags":[],
//   "rawTags":[],
//   "url":"http://optimal-help-842.appalot.me/install",
//   "contentType":"Appmaker",
//   "locale":"en-US",
//   "title":"Dattu's Rocket launcher",
//   "description":"",
//   "author":"swapnilghan",
//   "published":true,
//   "tags":[],
//   "thumbnail":"http://appmaker.mozillalabs.com/images/mail-man.png",
//   "username":"swapnilghan",
//   "remixedFrom":null,
//   "_id":"53bee56fe1fe11a32100040d",
//   "emailHash":"113cd6c8cd9d8f64c2ba7cc5baa403b6",
//   "createdAt":1405019503829,
//   "updatedAt":1405019503829,
//   "likes":[],
//   "reports":[],
//   "remixurl":"https://apps.webmaker.org/designer?remix=http%253A%252F%252Foptimal-help-842.appalot.me%252Fapp",
//   "editurl":"https://apps.webmaker.org/designer?edit=Dattu's%20Rocket%20launcher","id":"53bee56fe1fe11a32100040d"
// }
