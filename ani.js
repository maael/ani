#!/usr/bin/env node
var program = require('commander')
  , Table = require('cli-table')
  , wrap = require('word-wrap')
  , db = require('./lib/db')
  , log = require('./lib/logger')({ component: 'ani' })
  , aniDb = require('./lib/aniDB')
  , chalk = require('chalk')
  , inquire = require('inquirer')

function transformStatus(status) {
  status = status || 'Processing'
  if (status === 'Currently Airing') {
    status = chalk.green(status)
  } else if (status === 'Finished Airing') {
    status = chalk.gray(status)
  } else if (status === 'Not yet aired') {
    status = chalk.blue(status)
  } else if (status === 'Processing') {
    status = chalk.yellow(status)
  }
  return status
}

function seriesSearch() {
  return new Promise(function (resolve, reject) {
    inquire.prompt(
      { name: 'initialSearch'
      , message: 'Search for series'
      }
    , function (answers) {
        resolve(answers.initialSearch)
      })    
  })
}

function selectSeries(possibleSeries) {
  return new Promise(function (resolve, reject) {
    var possibleSeriesNames = possibleSeries.Series
          .map(function (series) { 
            return (
              { name: series.SeriesName[0] 
              , value: 
                { seriesId: series.id[0]
                , name: series.SeriesName[0] 
                }
              })
          })
    inquire.prompt(
      { type: 'list'
      , name: 'seriesSelection'
      , message: 'Select series'
      , choices: possibleSeriesNames
      }
    , function (answers) {
        resolve(answers.seriesSelection)
      }
    )
  })
}

function askDownloadName(series) {
  return new Promise(function (resolve, reject) {
    inquire.prompt(
      { name: 'downloadName'
      , message: 'Name on Nyaa (Leave blank to use the same)'
      }
    , function (answers) {
        series.downloadName = answers.downloadName || series.name
        resolve(series)
      })    
  })  
}

function askGroupName(series) {
  return new Promise(function (resolve, reject) {
    inquire.prompt(
      { name: 'group'
      , message: 'Subscriber Group'
      }
    , function (answers) {
        series.group = answers.group
        resolve(series)
      })    
  })  
}

function askQuality(series) {
  return new Promise(function (resolve, reject) {
    inquire.prompt(
      { type: 'list'
      , name: 'quality'
      , message: 'Quality'
      , choices: [ '720p', '1080p' ]
      }
    , function (answers) {
        series.quality = answers.quality
        resolve(series)
      })    
  })  
}

program
  .version('0.0.1')

program
  .command('start')
  .description('start ani watcher')
  .action(function () {
    console.log('started')
  })

program
  .command('list')
  .alias('ls')
  .description('list subscriptions')
  .action(function () {
    db
      .loadDB('subscriptions')
      .then(db.getSubscriptions)
      .then(function (subscriptions) {
        var table = new Table(
            { head: [ 'ID', 'Name', 'Download Name', 'Group', 'Quality', 'Episodes', 'Downloaded', 'Status' ]
            , colWidths: [ 5, 30, 15, 15, 10, 10, 12, 20 ]
            })
        subscriptions.forEach(function (sub, index) {
          var status = transformStatus(sub.status)
          table.push(
            [ index + 1, sub.title || sub.name, sub.downloadName, sub.group, sub.quality, sub.episodes || 0, sub.downloaded || 0, status ]
          )
        })
        console.log(table.toString())
        inquire.prompt(
          { name: 'moreDetails'
          , message: 'Show more details for episode with ID (0 to exit)'
          }
        , function (answers) {
            if (answers.moreDetails !== '0') {
              if (subscriptions[answers.moreDetails - 1]) {
                var table = new Table()
                  , sub = subscriptions[answers.moreDetails - 1]
                Object.keys(sub).forEach(function (key) {
                  function capitalizeFirstLetter(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                  }
                  if ([ 'id', '_id', 'image', 'seriesId' ].indexOf(key) === -1) {
                    var row = {}
                      , prettyKey = capitalizeFirstLetter(key.replace(/_/g, ' '))
                    row[prettyKey] = (sub[key] === null || sub[key] === undefined) ? '' : sub[key]
                    if (key === 'synopsis') row[prettyKey] = wrap(row[prettyKey], { width: 100 })
                    if (key === 'status') row[prettyKey] = transformStatus(row[prettyKey])
                    table.push(row)
                  }
                })
                console.log(table.toString())
              } else {
                console.log(chalk.red('Error: No valid sub found'))
              }
            }
          })
      })
  })

program
  .command('add')
  .alias('a')
  .description('add a subscription')
  .action(function () {
    db
      .loadDB('subscriptions')
      .then(seriesSearch)
      .then(aniDb.getSeries)
      .then(selectSeries)
      .then(askDownloadName)
      .then(askGroupName)
      .then(askQuality)
      .then(db.addSubscription)
      .then(function (subscription) {
        var table = new Table(
            { head: [ 'Name', 'Download Name', 'Group', 'Quality', 'Episodes', 'Downloaded', 'Status' ]
            , colWidths: [ 30, 15, 15, 10, 10, 12, 20 ]
            })
        table.push(
          [ subscription.name, subscription.downloadName, subscription.group, subscription.quality, 0, 0, chalk.yellow('Processing') ]
        )
        console.log(table.toString())
        return log('info', 'Added subscription', subscription)(subscription)
      })
      .catch(function (err) {
        console.log(chalk.red(err))
      })
  })

program
  .parse(process.argv)
