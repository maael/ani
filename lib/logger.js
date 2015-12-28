var bunyan = require('bunyan')
  , streams = []
  , environment = process.env.NODE_ENV || 'development'
  , logger 

streams.push(
  { path: __dirname + '/../log/ani-' + environment + '.log'
  })

logger = bunyan.createLogger(
  { name: 'ani'
  , streams: streams
  })

logger.on('error', function (err, stream) {
  console.log('Bunyan had an error', err)
})

function log(level, message, object) {
  var fileLogger = logger.child({ file: module.parent.filename || __filename })
  return function (returnValue) {
    if (object) {
      fileLogger[level](message, object)
    } else {
      fileLogger[level](message)
    }
    return returnValue
  }
}

module.exports = log