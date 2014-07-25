var geckoboard = require('../lib/geckoboard');
var makeapi = new require('makeapi-client')({
  apiURL: 'https://makeapi.webmaker.org'
});

function test (res, key, fieldName) {
  makeapi
  .contentType( "Appmaker" )
  .then(function( err, makes ) {
    if( err ) {
      res.json({"error": err});
    }
    res.json(makes);
  });
}

module.exports = {
  test: test
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
