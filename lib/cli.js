var chalk = require('chalk')
  , inquirer = require('inquirer')
  , ani = require('./db')
  , mal = require('./mal')
  , nyaa = require('./nyaa')
  , loader = require('./loader')

module.exports = (function () {
  function configMAL() {
    inquirer.prompt(
      [ { type: 'input'
        , name: 'user'
        , message: 'MAL Username:'
        }
      , { type: 'password'
        , name: 'password'
        , message: 'MAL Password'
        }
      ]
    , function (answer) {
        mal.saveConfig(answer)
      }
    )
  }

  function settings() {

  }

  function search(anime) {
    anime = anime || ''
    console.log('Searching for %s', anime)
    var searchLoader = loader()
    searchLoader.start()
    mal.query(anime)
    .then(function (res) {
      var animeOptions = res.anime.entry.map(function (current, index) {
          return {
            name: current.title[0]
          , value: index
          }
        })
        , selectedAnime
      searchLoader.stop()
      inquirer.prompt(
        [ { type: 'list'
          , name: 'selectedAnime'
          , message: 'Choose the anime'
          , choices: animeOptions
          }
        ]
      , function (answer) {
        selectedAnime = res.anime.entry[answer.selectedAnime]
        inquirer.prompt(
          [ { type: 'confirm'
            , name: 'confirmSelection'
            , message: 'Subscribe to ' + selectedAnime.title[0]
            }
          ]
        , function (answer) {
            if (answer.confirmSelection) {
              ani
                .loadDB('subscriptions')
                .then(ani.addSubscription(selectedAnime))
            }
          })
      })
    })
    .catch(function (e) {
      searchLoader.stop()
      console.log(chalk.red(e))
    })
  }

  function list(options) {
    var listLoader = loader()
      , getSubscriptions
    listLoader.start()
    if (options.filter === 'current') {
      getSubscriptions = ani.getCurrentlyAiring
    } else {
      getSubscriptions = ani.getSubscriptions
    }
    ani
      .loadDB('subscriptions')
      .then(getSubscriptions)
      .then(function (subscriptions) {
        listLoader.stop()
        console.log(chalk.blue.bold.underline('Subscriptions'))
        for (var i = 0; i < subscriptions.length; i++) {
          console.log([
            subscriptions[i].title[0]
          , ' - '
          , subscriptions[i].downloaded
          , '/'
          , subscriptions[i].episodes
          ].join(''))
        }
      })
  }

  function getDownloadName(found, subscription) {
    var foundNames = Object.keys(found)
    for(var i = 0; i < subscription.possibleNames.length; i++) {
      var name = subscription.possibleNames[i]
      if(foundNames.indexOf(name) > -1) return name
    }
  }

  function showSubscriptionStatus(found, subscriptions) {
    for(var i = 0; i < subscriptions.length; i++) {
      var downloadName = getDownloadName(found, subscriptions[i])
      if (found[downloadName]) {
        console.log(chalk.green(downloadName) + ' - D:' + subscriptions[i].downloaded +' A:' + found[downloadName].length + ' E:' + subscriptions[i].episodes)
      } else {
        console.log(chalk.red(subscriptions[i].title[0]))
      }
    }
  }

  function start() {
    console.log(chalk.green.underline.bold('Checking subscriptions statuses'))
    ani
      .loadDB('subscriptions')
      .then(ani.getSubscriptions)
      .then(nyaa.getSubscriptions)
      .then(function (subscriptionInfo) {
        showSubscriptionStatus(subscriptionInfo.foundSubscriptions, subscriptionInfo.subscriptions)
      })
      .catch(function (e) {
        console.log(chalk.red(e))
      })
  }

  return {
    configMAL: configMAL
  , settings: settings
  , search: search
  , list: list
  , start: start
  }
})()
