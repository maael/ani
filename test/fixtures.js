var moment = require('moment')

module.exports.subscriptions =
  [ { name: 'Test'
    , downloadName: 'Testing'
    , group: 'Test Group'
    , quality: '720p'
    , downloaded: 0
    , subscribedDate: moment().format('DD-MM-YYYY')
    }
  , { name: 'Test2'
    , downloadName: 'Testing2'
    , group: 'Test Group'
    , quality: '720p' 
    , downloaded: 0
    , subscribedDate: moment().format('DD-MM-YYYY')
    }
  ]

module.exports.episodes =
  [ { title: 'Test'
    , category: 'English-translated Anime'
    , link: 'http://google.com'
    , guid: 'http://google.com'
    , pubDate: moment().format('ddd, DD MMM YYYY HH:mm:ss ZZ')
    }
  , { title: 'Test2'
    , category: 'English-translated Anime'
    , link: 'http://google.ca'
    , guid: 'http://google.ca'
    , pubDate: moment().format('ddd, DD MMM YYYY HH:mm:ss ZZ')
    }
  ]