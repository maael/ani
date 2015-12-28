var request = require('request')
  , fs = require('fs')
  , parseXML = require('xml2js').parseString
  , configPath = __dirname + '/../config.json'
  , config
  , log = require('./logger')

module.exports = function (searchTerm) {
  return new Promise(function (resolve, reject) {
    if (!config) {
      try {
        config = require(configPath)
        if (!config || !config.user || !config.auth) {
          throw new Error()
        }
      } catch (e) {
        reject(new Error ('Need to configure your MAL account'))
      }
    }
    var series = encodeURIComponent(searchTerm).replace(/%20/g, '+')
      , queryURL = 'http://myanimelist.net/api/anime/search.xml?q=' + series
    request.get(
      { headers:
        {
          'Authorization': 'Basic ' + config.auth
        }
      , url: queryURL
      }
    , function (err, res, body) {
        if (err) reject(err)
        parseXML(body, function (err, result) {
          if (err) reject(err)
          log('info', 'Received MAL response', { url: queryURL, result: result })()
          resolve(result)
        })
      }
    )
  })
}