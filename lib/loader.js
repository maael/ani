module.exports = function () {
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