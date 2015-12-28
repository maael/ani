var chai = require('chai')
  , should = chai.should()
  , mockFs = require('mock-fs')
  , moment = require('moment')
  , db = require('../lib/db')
  , fixtures = require('./fixtures')

function clearDB(dbName) {
  return new Promise(function (resolve) {
    db.dbs[dbName].remove({}, { multi: true }, function (err) {
      resolve()
    })
  })
}

function cleanResults(results) {
  return results.map(function (result) {
    delete result._id
    return result
  })  
}

function emptyArguments() { }

describe('db', function () {
  before(function () {
    mockFs(
      { '../db': mockFs.directory({ mode: 0755 })
      })
  })

  after(function () {
    mockFs.restore()
  })

  describe('public variables', function () {
    it('should expose dbs', function () {
      db.dbs.should.be.an('object')
    })
  })

  describe('public methods', function () {
    var expectedMethods = 
        [ 'load'
        , 'loadDB'
        , 'addSubscription'
        , 'getSubscriptions'
        , 'updateSubscriptions'
        , 'incrementSubscriptionDownloads'
        , 'getCurrentlyAiring'
        , 'addEpisode'
        , 'getEpisodes'
        , 'updateEpisodeStatus'
        ]

    expectedMethods.forEach(function (method) {
      it(`should expose #${method} function`, function () {
        db[method].should.be.a('function')
      })
    })
  })

  describe('#addSubscription', function () {
    beforeEach(function (done) {
      db
        .load()
        .then(clearDB.bind(null, 'subscriptions'))
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should add a subscription', function (done) {
      db
        .addSubscription(fixtures.subscriptions[0])
        .then(db.getSubscriptions)
        .then(cleanResults)
        .then(function (subs) {
          subs.should.be.length(1)
          subs.should.have.deep.members([ fixtures.subscriptions[0] ])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })
  })

  describe('#getSubscriptions', function () {
    beforeEach(function (done) {
      db
        .load()
        .then(clearDB.bind(null, 'subscriptions'))
        .then(db.addSubscription.bind(null, fixtures.subscriptions[0]))
        .then(db.addSubscription.bind(null, fixtures.subscriptions[1]))
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should get all subscriptions if no query passed', function (done) {
      db
        .getSubscriptions()
        .then(cleanResults)
        .then(function (subs) {
          subs.should.be.length(2)
          subs.should.have.deep.members(
            [ fixtures.subscriptions[0]
            , fixtures.subscriptions[1] 
            ])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should get subscriptions for a specified query', function (done) {
      db
        .getSubscriptions({ name: 'Test2' })
        .then(cleanResults)
        .then(function (subs) {
          subs.should.be.length(1)
          subs.should.not.have.deep.members([ fixtures.subscriptions[0] ])
          subs.should.have.deep.members([ fixtures.subscriptions[1] ])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })
  })

  describe('#updateSubscriptions', function () {
    beforeEach(function (done) {
      db
        .load()
        .then(clearDB.bind(null, 'subscriptions'))
        .then(db.addSubscription.bind(null, fixtures.subscriptions[0]))
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should update subscriptions to match the new subscriptions based on id', function (done) {
      var updatedSubscription
        , subscriptionId
      db
        .getSubscriptions()
        .then(function (subs) {
          updatedSubscription = [ JSON.parse(JSON.stringify(subs[0])) ]
          updatedSubscription[0].test = 'Updated'
          subscriptionId = updatedSubscription[0]._id
          return updatedSubscription
        })
        .then(db.updateSubscriptions)
        .then(db.getSubscriptions.bind(null, {}))
        .then(function (subs) {
          subs.should.be.length(1)
          subs[0]._id.should.equal(subscriptionId)
          return subs
        })
        .then(cleanResults)
        .then(function (subs) {
          subs[0].should.deep.equal(updatedSubscription[0])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })
  })

  describe('#incrementSubscriptionDownloads', function () {
    beforeEach(function (done) {
      db
        .load()
        .then(clearDB.bind(null, 'subscriptions'))
        .then(db.addSubscription.bind(null, fixtures.subscriptions[0]))
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should increment subscription first time', function (done) {
      db
        .getSubscriptions()
        .then(function (subs) {
          subs.should.be.length(1)
          subs[0].should.have.property('downloaded', 0)
        })
        .then(db.incrementSubscriptionDownloads.bind(null, 'Test'))
        .then(db.getSubscriptions)
        .then(function (subs) {
          subs.should.be.length(1)
          subs[0].should.have.property('downloaded', 1)
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should increment subscription subsequent times', function (done) {
      db
        .getSubscriptions()
        .then(function (subs) {
          subs.should.be.length(1)
          subs[0].should.have.property('downloaded', 0)
        })
        .then(db.incrementSubscriptionDownloads.bind(null, 'Test'))
        .then(db.getSubscriptions)
        .then(function (subs) {
          subs.should.be.length(1)
          subs[0].should.have.property('downloaded', 1)
        })
        .then(db.incrementSubscriptionDownloads.bind(null, 'Test'))
        .then(db.getSubscriptions)
        .then(function (subs) {
          subs.should.be.length(1)
          subs[0].should.have.property('downloaded', 2)
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })
  })

  describe('#addEpisode', function () {
    beforeEach(function (done) {
      db
        .load()
        .then(clearDB.bind(null, 'episodes'))
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should add an episode', function (done) {
      db
        .addEpisode(fixtures.episodes[0])
        .then(db.getEpisodes.bind(null, {}))
        .then(cleanResults)
        .then(function (eps) {
          eps.should.be.length(1)
          eps[0].should.deep.equal(fixtures.episodes[0])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should not duplicate any episode if added multiple times', function (done) {
      db
        .addEpisode(fixtures.episodes[0])
        .then(db.addEpisode.bind(null, fixtures.episodes[0]))
        .then(db.getEpisodes.bind(null, {}))
        .then(cleanResults)
        .then(function (eps) {
          eps.should.be.length(1)
          eps[0].should.deep.equal(fixtures.episodes[0])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })
  })

  describe('#getEpisodes', function () {
    beforeEach(function (done) {
      db
        .load()
        .then(clearDB.bind(null, 'episodes'))
        .then(db.addEpisode.bind(null, fixtures.episodes[0]))
        .then(db.addEpisode.bind(null, fixtures.episodes[1]))
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should get all episodes if no query passed', function (done) {
      db
        .getEpisodes()
        .then(cleanResults)
        .then(function (subs) {
          subs.should.be.length(2)
          subs.should.have.deep.members(
            [ fixtures.episodes[0]
            , fixtures.episodes[1] 
            ])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should get episodes for a specified query', function (done) {
      db
        .getEpisodes({ title: 'Test2' })
        .then(cleanResults)
        .then(function (subs) {
          subs.should.be.length(1)
          subs.should.not.have.deep.members([ fixtures.episodes[0] ])
          subs.should.have.deep.members([ fixtures.episodes[1] ])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })
  })

  describe('#updateEpisodeStatus', function () {
    beforeEach(function (done) {
      db
        .load()
        .then(clearDB.bind(null, 'episodes'))
        .then(db.addEpisode.bind(null, fixtures.episodes[0]))
        .then(db.addEpisode.bind(null, fixtures.episodes[1]))
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })

    it('should only update an episode with the guid to the status', function (done) {
      db
        .updateEpisodeStatus('http://google.ca', 'Downloaded')
        .then(db.getEpisodes.bind(null, {}))
        .then(cleanResults)
        .then(function (subs) {
          var updatedEpisode = JSON.parse(JSON.stringify(fixtures.episodes[1]))
          updatedEpisode.status = 'Downloaded'
          subs.should.be.length(2)
          subs.should.have.deep.members([ fixtures.episodes[0], updatedEpisode ])
          subs.should.not.have.deep.members([ fixtures.episodes[1] ])
        })
        .then(emptyArguments)
        .then(done)
        .catch(done)
    })
  })
})