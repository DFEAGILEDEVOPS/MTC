'use strict'

require('dotenv').config()

const q = 'amqplib-spike'
const amqplib = require('amqplib')

const busConfig = {
  host: process.env.ServiceBusHost,
  queueName: process.env.ServiceBusQueueName,
  user: process.env.ServiceBusUsername, // Azure: SASKeyName
  password: process.env.ServiceBusPassword, // Azure: SASKey
  protocol: process.env.ServiceBusProtocol || 'amqps'
}

const uri = busConfig.protocol + '://' + encodeURIComponent(busConfig.user) + ':' + encodeURIComponent(busConfig.password) + '@' + busConfig.host
const connection = amqplib.connect(uri)

// Publisher
connection.then(function (conn) {
  return conn.createChannel()
}).then(function (ch) {
  return ch.assertQueue(q).then(function (ok) {
    return ch.sendToQueue(q, new Buffer('something to do'))
  })
}).catch(console.warn)

// Consumer
connection.then(function (conn) {
  return conn.createChannel()
}).then(function (ch) {
  return ch.assertQueue(q).then(function (ok) {
    return ch.consume(q, function (msg) {
      if (msg !== null) {
        console.log(msg.content.toString())
        ch.ack(msg)
      }
    })
  })
}).catch(console.warn)
