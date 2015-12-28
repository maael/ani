var request = require('request')
  , parseXML = require('xml2js').parseString

module.exports = function (subs) {
  var promises = subs.map(queryPromise)
  return Promise.all(promises)   
}

function buildQuery (sub) {
  var term = `[${sub.group}] ${sub.title} [${sub.quality}]`
    , query = 'http://www.nyaa.se/?page=rss&term='
  term = encodeURIComponent(term).replace(/%20/g, '+')
  return query + term
}

function queryPromise (sub) {
  return new Promise(function (resolve, reject) {
    var query = buildQuery(sub)
    request(query, function (err, res, body) {
      if (err) reject(err)
      parseXML(body, function (err, result) {
        if (err) reject(err)
        var result = result.rss.channel[0]
          , foundItems = {}
        if (result.item) {
          var items = result.item.map(function (item) {
            item.title = item.title.toString()
            item.category = item.category.toString()
            item.link = item.link.toString()
            item.guid = item.guid.toString()
            item.description = item.description.toString()
            item.pubDate = item.pubDate.toString()
            return item
          })
        }
        foundItems[sub.downloadName] = (items ? items : [])
        resolve(foundItems)
      })
    })
  })
}