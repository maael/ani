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
      subscription.subscribedDate = moment().format('DD-MM-YYYY')
      dbs.subscriptions.insert(subscription, function (err, insertedDoc) {
        if (err) reject(err)
        resolve(insertedDoc)
      })
    })
  }

  function updateSubscriptions(subscriptions) {
    var updates = subscriptions.map(function (subscription) {
      return new Promise(function (resolve, reject) {
        var id = subscription._id
        delete subscription._id
        dbs.subscriptions.update({ _id: id }
        , subscription
        , {}
        , function (err, replaced, newDoc) {
            if (err) reject(err)
            resolve(newDoc)
          })
      })      
    })
    return Promise.all(updates)
  }

  function incrementSubscriptionDownloads(name) {
    return new Promise(function (resolve, reject) {
      dbs.subscriptions.update({ name: name }
      , { $inc: { downloaded: 1 } }
      , {}
      , function (err, replaced, newDoc) {
          if (err) return reject(err)
          resolve(newDoc)
        })
    })
  }

  function getCurrentlyAiring() {
    return new Promise(function (resolve, reject) {
      dbs.subscriptions.find({ $not: { status: 'Finished Airing' } }
      , function (err, airing) {
          if (err) reject(err)
          resolve(airing)
        })
    })
  }

  function addEpisode(episode) {
    return new Promise(function (resolve, reject) {
      getEpisodes({ guid: episode.guid })
        .then(function (episodes) {
          if (episodes.length != 0) return resolve()
          dbs.episodes.insert(episode, function (err, newDoc) {
            if (err) reject(err)
            resolve(newDoc)
          })
        })
    })
  }

  function updateEpisodeStatus(guid, status) {
    return new Promise(function (resolve, reject) {
      dbs.episodes.update({ guid: guid }
      , { $set: { status: status } }
      , {}
      , function (err, updated, updatedDoc) {
          if (err) return reject(err)
          resolve(updatedDoc)
        })
    })
  }

  function getEpisodes(query) {
    return new Promise(function (resolve, reject) {
      query = query || {}
      dbs.episodes.find(query, function (err, episodes) {
        if (err) reject(err)
        resolve(episodes)
      })
    })
  }

  function getSubscriptions(query) {
    return new Promise(function (resolve, reject) {
      query = query || {}
      dbs.subscriptions.find(query, function (err, subscriptions) {
        if (err) reject(err)
        resolve(subscriptions)
      })
    })
  }

  return {
    dbs: dbs
  , load: load
  , loadDB: loadPromise
  , addSubscription: addSubscription
  , getSubscriptions: getSubscriptions
  , updateSubscriptions: updateSubscriptions
  , incrementSubscriptionDownloads: incrementSubscriptionDownloads
  , getCurrentlyAiring: getCurrentlyAiring
  , addEpisode: addEpisode
  , getEpisodes: getEpisodes
  , updateEpisodeStatus: updateEpisodeStatus
  }
})()