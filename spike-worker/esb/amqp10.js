'use strict'

require('dotenv').config()
const AMQPClient = require('amqp10').Client
const Policy = require('amqp10').Policy

const busConfig = {
  host: process.env.ServiceBusHost,
  queueName: process.env.ServiceBusQueueName,
  user: process.env.ServiceBusUsername, // Azure: SASKeyName
  password: process.env.ServiceBusPassword, // Azure: SASKey
  protocol: process.env.ServiceBusProtocol || 'amqps'
}

if (!busConfig.host || !busConfig.queueName || !busConfig.user || !busConfig.password) {
  console.warn('Service Bus connection environment variables are required.')
  process.exit(1)
}

const msgVal = Math.floor(Math.random() * 1000000)

const uri = busConfig.protocol + '://' + encodeURIComponent(busConfig.user) + ':' + encodeURIComponent(busConfig.password) + '@' + busConfig.host
// var uri = busConfig.protocol + '://' + busConfig.host
console.log(`connecting to ${uri}`)
const client = new AMQPClient(Policy.ServiceBusQueue)
client.connect(uri)
  .then(function () {
    console.log('connected.')
    return Promise.all([
      client.createSender(busConfig.queueName),
      client.createReceiver(busConfig.queueName)
    ])
  })
  .spread(function (sender, receiver) {
    sender.on('errorReceived', function (txErr) { console.warn('===> TX ERROR: ', txErr) })
    receiver.on('errorReceived', function (rxErr) { console.warn('===> RX ERROR: ', rxErr) })
    receiver.on('message', function (message) {
      console.log('received: ', message.body)
      if (message.annotations) console.log('annotations: ', message.annotations)
      if (message.body.DataValue === msgVal) {
        client.disconnect().then(function () {
          console.log('disconnected, when we saw the value we inserted.')
          process.exit(0)
        })
      }
    })

    return sender.send({ DataString: 'From Node', DataValue: msgVal }).then(function (state) {
      // this can be used to optionally track the disposition of the sent message
      console.log('state: ', state)
    })
  })
  .error(function (e) {
    console.warn('connection error: ', e)
  })
