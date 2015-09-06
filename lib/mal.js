var request = require('request')
  , parseXML = require('xml2js').parseString
  , configPath = __dirname + '/../config.json'
  , config
  , fs = require('fs')

module.exports = (function () {
  function saveConfig(newConfig) {
    return new Promise(function (resolve, reject) {
      newConfig.auth = new Buffer(newConfig.user + ':' + newConfig.password).toString('base64')
      delete newConfig.password
      fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), function (err) {
        if (err) reject(err)
        config = newConfig
        resolve()
      })
    })
  }
  function query (searchTerm) {
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
            resolve(result)
          })
        }
      )
    })
  }
  return {
    query: query
  , saveConfig: saveConfig
  }
})()
