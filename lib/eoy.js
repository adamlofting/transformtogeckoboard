var fs = require('fs');
var geckoboard = require('../lib/geckoboard');


function outputFileToJSON (file, res) {
  try {
    mostActive = fs.readFileSync( file, 'utf-8' );
    mostActive = JSON.parse( mostActive );
    res.json( mostActive );
  }
  catch ( e ) {
    console.log(e);
    res.status( 503 ).json( { "error" : "Failed to load from file " + file } );
  }
}


function EOYDonationsByCountry (res) {
  outputFileToJSON('./static/eoy-donations-by-country.json', res);
}

function EOYDonationsByContinent (res) {
  outputFileToJSON('./static/eoy-donations-by-continent.json', res);
}

function EOYDonationsBySource (res) {
  outputFileToJSON('./static/eoy-donations-by-source.json', res);
}

function EOYTransactionsByCountry (res) {
  outputFileToJSON('./static/eoy-transactions-by-country.json', res);
}

function EOYTransactionsByContinent (res) {
  outputFileToJSON('./static/eoy-transactions-by-continent.json', res);
}

function EOYTransactionsBySource (res) {
  outputFileToJSON('./static/eoy-transactions-by-source.json', res);
}


module.exports = {
  EOYDonationsByCountry: EOYDonationsByCountry,
  EOYDonationsByContinent: EOYDonationsByContinent,
  EOYDonationsBySource: EOYDonationsBySource,
  EOYTransactionsByCountry: EOYTransactionsByCountry,
  EOYTransactionsByContinent: EOYTransactionsByContinent,
  EOYTransactionsBySource: EOYTransactionsBySource
};

