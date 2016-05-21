var request = require('request')
  , parseXML = require('xml2js').parseString
  , key = '1A21C029FA398C36'
  , apiUrl = 'http://thetvdb.com/api/'

function xmlToJson(xml) {
  return new Promise(function (resolve, reject) {
    parseXML(xml, function (err, result) {
      if (err) return reject(err)
      resolve(result.Data)
    })
  })
}

function getSeries(name) {
  return new Promise(function (resolve, reject) {
    request(`${apiUrl}GetSeries.php?seriesname=${name}`
    , function (err, res, body) {
        if (err) return reject(err)
        resolve(body)
      })
  })
  .then(xmlToJson)
}

function getSeriesZip(id) {
  return new Promise(function (resolve, reject) {
    request(`${apiUrl + key}/series/${id}/all/en.xml`
    , function (err, res, body) {
        if (err) return reject(err)
        resolve(body)
      })
  })
  .then(xmlToJson)
}

module.exports =
  { getSeries: getSeries
  , getSeriesZip: getSeriesZip
  }