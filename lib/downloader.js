var torrent = require('./torrent')
  , fetchNewEpisodes = require('./episodesFetcher')
  , db = require('./db')
  , log = require('./logger')

function download(eps) {
  eps = eps.map(function (ep) {
    return new Promise(function (resolve, reject) {
      torrent.add(ep.link
      , { path: torrent.downloadFolder }
      , function (torrent) {
        var previousProgress = 0
        log('info', `Started downloading ${ep.title}`)()
          torrent.on('done', function () {
            log('info', `Finished downloading ${ep.title}`)()
            db
              .updateEpisodeStatus(ep.guid, 'Downloaded')
              .then(db.incrementSubscriptionDownloads.bind(null, ep.title))
              .then(resolve.bind(null, ep))
          })
          torrent.on('download', function (chunkSize) {
            var progress = parseInt(torrent.progress * 100)
            if (previousProgress < progress) {
              previousProgress = progress
              log('info', `Progress | ${ep.title} at ${progress}%`)()
            }
          })
        })
    })
  })
  return Promise.all(eps)
}

module.exports = function (subs) {
  return new Promise(function (resolve, reject) {
    fetchNewEpisodes(subs)
      .then(db.load)
      .then(db.getEpisodes.bind(null, { status: { $ne: 'Downloaded' } }))
      .then(download)
      .then(resolve)
      .catch(reject)
  })
} 