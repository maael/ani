module.exports = function (subscriptions) {
  subscriptions.forEach(function (sub) {
    var series = Object.keys(sub)[0]
      , episodes = sub[series]
    episodes.map(function (episode) {
      var group = /\[(.*?)\]/.exec(episode.title)
        , episodeNumber = /\- ([0-9]+) \[/.exec(episode.title)
        , quality = /.+\[(.*?)\]/.exec(episode.title)
      delete episode.description
      episode.series = series
      if (group) episode.group = group[1]
      if (episodeNumber) episode.episode = episodeNumber[1]
      if (quality) episode.quality = quality[1]
      return episode
    })
  })
  return subscriptions
}