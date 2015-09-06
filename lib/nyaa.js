var request = require('request')
  , parseXML = require('xml2js').parseString

module.exports = (function () {
  function addPossibleNames(subscriptions) {
    return subscriptions.map(function (subscription) {
      subscription.possibleNames = [].concat(
          subscription.title[0]
        , subscription.english[0]
        , subscription.synonyms[0].split(';')
        )
        .map(function (element) {
          return element.trim()
        })
        .filter(function (element, index, names) {
          return element !== '' && names.indexOf(element) === index
        })
      return subscription
    })
  }
  function getSubscriptions(subscriptions) {
    return new Promise(function(resolve, reject) {
      subscriptions = addPossibleNames(subscriptions)
      var subsPossibleNames = subscriptions.map(function (subscription) {
            return subscription.possibleNames
          })
      getPossibleNamesPromises(subsPossibleNames)
        .then(function (possibleNames) {
          var foundSubscriptions = possibleNames
            .map(function (names) {
              return names
                .filter(function (name) { return name.found })
            })
            .filter(function (items) {
              return items.length > 0
            })
            .reduce(function (found, subscription) {
              found[subscription[0].name] = subscription[0].items
              return found
            }, {})
          resolve({
            'subscriptions': subscriptions
          , 'foundSubscriptions': foundSubscriptions
          })
        })
    })
  }

  function getPossibleNamesPromises(possibleNames) {
    return Promise.all(possibleNames.map(function (names) {
      return Promise.all(names.map(getNamePromise))
    }))
  }

  function getNamePromise(name) {
    return new Promise(function (resolve, reject) {
      var term = '[Horrible Subs] ' + name + ' [720p]'
        , query = 'http://www.nyaa.se/?page=rss&term='
      term = encodeURIComponent(term).replace(/%20/g, '+')

      request(query+term,
        function (err, res, body) {
          if (err) reject(err)
          parseXML(body, function (err, result) {
            if (err) reject(err)
            resolve({
              'name': name
            , 'found': typeof result.rss.channel[0].item === 'object' && result.rss.channel[0].item.length > 0
            , 'items': result.rss.channel[0].item || []
            })
          })
        }
      )
    })
  }

  return {
    getSubscriptions: getSubscriptions
  }
})()
