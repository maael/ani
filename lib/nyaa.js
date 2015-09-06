var request = require('request')

module.exports = (function () {
  function getSubscriptions(subscriptions) {
    return new Promise(function(resolve, reject) {
      var possibleNames =
        subscriptions.map(function (subscription) {
          return [].concat(
              subscription.title[0]
            , subscription.english[0]
            , subscription.synonyms[0].split(';')
            )
            .map(function (element) {
              return element.trim()
            })
            .filter(function (element) {
              return element !== ''
            })
        })
      console.log(possibleNames)
    })
  }

  return {
    getSubscriptions: getSubscriptions
  }
})()
