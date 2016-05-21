var request = require('request')
  , moment = require('moment')
  , entities = require('html-entities').AllHtmlEntities
  , mal = require('../lib/mal')
  , log = require('../lib/logger')({ component: 'seriesEmbellisher' })

module.exports = function (subscription) {
  return new Promise(function (resolve, reject) {
    mal(subscription.downloadName)
      .then(function (json) {
        if (json) {
          var entry = json.anime.entry[0]
          entry._id = subscription._id
          entry.downloadName = subscription.downloadName || entry.title[0].toString()
          entry.group = subscription.group
          entry.quality = subscription.quality || 720
          entry.downloaded = subscription.downloaded || 0
          entry.aired = subscription.aired || 0
          entry.id = entry.id.toString()
          entry.title = entry.title.toString()
          entry.synonyms = entry.synonyms.toString().split('; ')
          entry.episodes = parseInt(entry.episodes.toString())
          entry.score = parseFloat(entry.score.toString())
          entry.type = entry.type.toString()
          entry.status = entry.status.toString()
          entry.start_date = moment(entry.start_date.toString()).format('DD-MM-YYYY')
          entry.end_date = moment(entry.end_date.toString()).format('DD-MM-YYYY')
          if (entry.end_date === 'Invalid date') entry.end_date = null
          entry.synopsis = entities.decode(entry.synopsis.toString().replace(/(<([^>]+)>)/ig, '').replace(/[\n\r]/g, ''))
          entry.image = entry.image.toString()
          resolve(entry)
        } else {
          reject(new Error('Failed to get anime entry to embellish for ' + subscription.downloadName))
        }
      })
      .catch(reject)
  })
}