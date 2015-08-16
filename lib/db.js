var Datastore = require('nedb')
  , moment = require('moment')

module.exports = (function () {
  var dbs =
    { episodes: new Datastore({ filename: __dirname + '/../db/episodes' })
    , subscriptions: new Datastore({ filename: __dirname + '/../db/subscriptions' })
    }

  function loadPromise(dbName) {
    return new Promise(function (resolve, reject) {
      dbs[dbName].loadDatabase(function (err) {
        if (err) reject(err)
        resolve()
      })
    })
  }

  function load() {
    var promises = Object.keys(dbs).map(loadPromise)
    return Promise.all(promises)
  }

  function addSubscription(subscription) {
    return new Promise(function (resolve, reject) {
      subscription.downloaded = 0
      subscription.subscribedDate = moment()
      dbs.subscriptions.insert(subscription, function (err, insertedDoc) {
        if (err) reject(err)
        resolve(insertedDoc)
      })
    })
  }

  function addEpisode(episode) {
    return new Promise(function (resolve, reject) {
      dbs.episodes.insert(episode, function (err, insertedDoc) {
        if (err) reject(err)
        resolve(insertedDoc)
      })
    })
  }

  function getSubscriptions() {
    return new Promise(function (resolve, reject) {
      dbs.subscriptions.find({}, function (err, subscriptions) {
        if (err) reject(err)
        resolve(subscriptions)
      })
    })
  }

  function getCurrentlyAiring() {
    return new Promise(function (resolve, reject) {
      dbs.subscriptions.find(
        {
          $not: { status: 'Finished Airing' }
        }
      , function (err, airing) {
          if (err) reject(err)
          resolve(airing)
        }
      )
    })
  }

  return {
    load: load
  , loadDB: loadPromise
  , addSubscription: addSubscription
  , addEpisode: addEpisode
  , getSubscriptions: getSubscriptions
  , getCurrentlyAiring: getCurrentlyAiring
  }
})()
