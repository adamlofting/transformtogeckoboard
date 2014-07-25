// https://developer.geckoboard.com/#number-and-secondary-stat
function numberAndSecondaryStat (number, text) {
  var output = {
    "item": [
      {
        "value": number,
        "text": text
      }
    ]
  };
  return output;
}

module.exports = {
  numberAndSecondaryStat:numberAndSecondaryStat
};

