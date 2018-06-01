'use strict'

const AMQPClient = require('amqp10').Client
const Policy = require('amqp10').Policy

const listen = () => {
  const busConfig = {
    host: process.env.ServiceBusHost,
    queueName: process.env.ServiceBusQueueName,
    user: process.env.ServiceBusUsername, // Azure: SASKeyName
    password: process.env.ServiceBusPassword, // Azure: SASKey
    protocol: process.env.ServiceBusProtocol || 'amqps'
  }

  if (!busConfig.host || !busConfig.queueName || !busConfig.user || !busConfig.password) {
    console.warn('Service Bus connection details are required.')
    process.exit(1)
  }

  const uri = busConfig.protocol + '://' + encodeURIComponent(busConfig.user) + ':' + encodeURIComponent(busConfig.password) + '@' + busConfig.host
  console.log(`connecting to ${busConfig.host}`)
  const client = new AMQPClient(Policy.ServiceBusQueue)
  client.connect(uri)
    .then(function () {
      console.log('connected.')
      client.createReceiver(busConfig.queueName)
        .then(function (receiver) {
          receiver.on('errorReceived', function (rxErr) { console.warn('===> RX ERROR: ', rxErr) })
          receiver.on('message', function (message) {
            console.log('received: ', message.body)
            if (message.annotations) console.log('annotations: ', message.annotations)
          })
        })
    })
    .error(function (e) {
      console.warn('connection error: ', e)
    })
}

module.exports = listen
