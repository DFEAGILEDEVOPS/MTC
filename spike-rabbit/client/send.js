'use strict'

const amqp = require('amqp')
const queueName = 'speak'
const amqpHost = process.env.AMQP_HOST || 'amqp://localhost:5672'

const send = (message) => {
  console.log('opening AMQP connection to service bus...')

  var connection = amqp.createConnection({ host: amqpHost }, {reconnect: false})

  console.log('Connection Created. Waiting for connection be ready...')

  // Wait for connection to become established.
  connection.on('ready', function () {
    console.log('Connection ready for use. Connecting to "hello" queue...')

    connection.queue(queueName, { autoDelete: false }, function (q) {
      console.log(`Connected to ${queueName} queue. Waiting for queue to become ready`)

      // Bind to all messages
      q.bind('#')

      q.on('queueBindOk', function () {
        console.log(`The ${queueName} queue is now ready for use. Publishing message...`)

        const body = `${message} @ ${new Date()}`
        connection.publish(queueName, body)

        console.log('Published message: "' + body + '"')
        // Allow 1 second for the message publishing to complete
        setTimeout(function () {
          console.log('Disconnecting...')

          connection.disconnect()

          console.log('Disconnected. Exiting...')
        }, 1000)
      })
    })
  })
}

module.exports = send
