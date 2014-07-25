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

// https://developer.geckoboard.com/#funnel
function funnel (arr, valueFieldName, labelFieldName) {
  // geckboard funnel holds a maximum of 8 items
  if (arr.length > 8) {
    arr = arr.slice(0,8);
  }

  var steps = [];
  for (var i = 0; i < arr.length; i++) {
    var step = {
      "value": arr[i][valueFieldName],
      "label": arr[i][labelFieldName]
    };
    steps.push(step);
  }
  var output = {
    "item": steps
  };
  return output;
}

module.exports = {
  numberAndSecondaryStat: numberAndSecondaryStat,
  funnel: funnel
};

