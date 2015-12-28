var WebTorrent = require('webtorrent')
  , client = new WebTorrent()

client.downloadFolder = __dirname + '/../torrents/' 
module.exports = client