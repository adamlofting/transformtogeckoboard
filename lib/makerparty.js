var NodeCache = require('node-cache');
var myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
var request = require('request');
var geckoboard = require('../lib/geckoboard');

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

function singleNumber (res, key, fieldName) {
  var cached = myCache.get(key);
  if (cached[key]) {
    // this was already saved in the cache
    res.json (cached[key]);
  } else {
    // we need to fetch this from makerparty data
    getFromMakerParty(fieldName, function (result) {
      var output = geckoboard.numberAndSecondaryStat(result, fieldName);
      // save this to cache for quicker round trip next time
      myCache.set (key, output);
      res.json(output);
    });
  }
}

module.exports = {
  getFromMakerParty:getFromMakerParty,
  singleNumber:singleNumber
};
