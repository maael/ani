var getEpisodesOnNyaa = require('./nyaa')
  , embellishEpisodes = require('./episodeEmbellisher')
  , db = require('./db')
  , log = require('./logger')({ component: 'episodeFetcher' })

module.exports = function (subs) {
  return getEpisodesOnNyaa(subs)
    .then(function (subs) {
      subs.forEach(function (sub) {
        var series = Object.keys(sub)[0]
        log('info', `Fetched ${sub[series].length} episodes for series '${series}'`)()
      })
      return subs
    })
    .then(embellishEpisodes)
    .then(function (subscriptions) {
      var episodes = []
      subscriptions.forEach(function (sub) {
        var series = Object.keys(sub)[0]
        episodes = episodes.concat(sub[series])
      })
      return episodes
    })
    .then(function (episodes) {
      var saveEpisodes = episodes.map(function (episode) {
        return db.addEpisode(episode)
      })
      return Promise.all(saveEpisodes)
    })
    .then(function (episodes) {
      return episodes.filter(function (episode) { return episode !== undefined })
    })
} 