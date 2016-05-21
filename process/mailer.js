var CronJob = require('cron').CronJob
  , nodemailer = require('nodemailer')
  , log = require('../lib/logger')({ component: 'mailer' })
  , job

log('info', 'Starting mailer')()
job = new CronJob(
  '0 0 13 */1 * *'
, function () {
    var transporter = nodemailer.createTransport()
      , mail = 
        { from: 'ani@test.com',
          to: 'matt.a.elphy@gmail.com',
          subject: 'New Episodes!',
          text: 'This will let me know of new episodes'
        }
    transporter.sendMail(mail)
    log('info', 'Sent mail', mail)()
  }
, function () {
    log('info', 'Exited mailer')()
  }
, true
, 'Europe/London'
)

