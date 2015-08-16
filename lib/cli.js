var chalk = require('chalk')
  , inquirer = require('inquirer')
  , ani = require('./db')
  , mal = require('./mal')

module.exports = (function () {
  function loader() {
    var timer
      , stage = 0
      , parts = [ '/', '-', '\\', '|' ]
    function startLoader() {
      process.stdout.write(parts[stage])
      stage++
      timer = setInterval(function () {
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        process.stdout.write(parts[stage])
        stage++
        if (stage >= parts.length) stage = 0
      }, 100)
    }
    function stopLoader() {
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
      clearInterval(timer)
    }
    return {
      start: startLoader
    , stop: stopLoader
    }
  }
  function configMAL() {
    inquirer.prompt(
      [
        {
          type: 'input'
        , name: 'user'
        , message: 'MAL Username:'
        }
      , {
          type: 'password'
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
    mal.query(anime).then(function (res) {
      var animeOptions = res.anime.entry.map(function (current, index) {
          return {
            name: current.title[0]
          , value: index
          }
        })
        , selectedAnime
      searchLoader.stop()
      inquirer.prompt(
        [
          { type: 'list'
          , name: 'selectedAnime'
          , message: 'Choose the anime'
          , choices: animeOptions
          }
        ]
      , function (answer) {
        selectedAnime = res.anime.entry[answer.selectedAnime]
        inquirer.prompt(
          [
            { type: 'confirm'
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

  return {
    configMAL: configMAL
  , settings: settings
  , search: search
  , list: list
  }
})()
