var db = require('./db')
  , ani = db

module.export = function () {
  this.on('addSubscription', function (sub) {
    console.log('ADDED SUB')
  })
  return this
}

// ani = db.load()
// .then(db.addSubscription({ hey: 'world' }))

// for (var i = 0; i < 3; i++) {
//   ani.then(db.addSubscription({ hey: i }))
// }

// ani.then(function () {
//   console.log('DONE')
//   console.log(arguments)
// })

// .addSubscription(function (newSub) {
//   return newSub
// }).then(function (doc) {
//   console.log('SUCCESS')
//   console.log(doc)
// }).catch(function (err) {
//   console.log('FUCK')
//   console.log(err)
// })
