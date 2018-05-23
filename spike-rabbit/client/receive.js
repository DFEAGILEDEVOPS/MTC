'use strict'

const amqp = require('amqp')
const queueName = 'speak'

const receive = () => {
  console.log('Starting to connect to Rabbit MQ...')

  var connection = amqp.createConnection({ host: process.env.AMQP_HOST }, {reconnect: false})

  console.log('Connection Created. Waiting for connection be ready...')

  // Wait for connection to become established.
  connection.on('ready', function () {
    console.log(`Connection ready for use. Connecting to ${queueName} queue...`)

    // Use the default 'amq.topic' exchange
    connection.queue(queueName, { autoDelete: false }, function (q) {
      console.log(`Connected to ${queueName} queue. Waiting for queue to become ready`)

      // Catch all messages
      q.bind('#')

      q.on('queueBindOk', function () {
        console.log(`The ${queueName} queue is now ready for use. Subscribing for messages (Ctrl+c to disconnect)...`)

        // Receive messages
        q.subscribe(function (message) {
          console.log('Received message... ')
          // Print messages to stdout
          var buf = new Buffer(message.data)
          console.log(buf.toString('utf-8'))
        })
      })
    })
  })
}

module.exports = receive
