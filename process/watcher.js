var db = require('../lib/db')
  , log = require('../lib/logger')({ component: 'watcher' })
  , embellisher = require('../lib/seriesEmbellisher')
  , downloader = require('../lib/downloader')

function embellish(subs) {
  var embellishSubs = subs.map(function (sub) {
    return embellisher(sub)
  })
  return Promise.all(embellishSubs)
}

var getActiveSubscriptions = 
      db.getSubscriptions.bind(null, { 'status': { $ne: 'Finished Airing' } })
  , getAllSubscriptions =
      db.getSubscriptions.bind(null, {})

module.exports = function (done) {
  return db
    .load()
    .then(log('info', 'Starting watcher'))
    .then(getActiveSubscriptions)
    .then(embellish)
    .then(function (subs) {
      return log('info', 'Updating subscriptions', subs)(subs)
    })
    .then(db.updateSubscriptions)
    .then(log('info', 'Updated subscriptions'))
    .then(log('info', 'Checking for downloads'))
    .then(getAllSubscriptions)
    .then(function (subs) {
      return subs.filter(function (s) { return s.episodes !== s.downloaded || s.episodes === 0 })
    })
    .then(downloader)
    .then(log('info', 'Checked downloads'))
    .then(log('info', 'Exiting watcher'))
    .then(done)
    .catch(function (err) {
      log('error', 'Error updating subscriptions', { err: err })()
      done(err)
    })
}