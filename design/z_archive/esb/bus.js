'use strict'

const AMQPClient = require('amqp10').Client
const Policy = require('amqp10').Policy

let messageSender

const busConfig = {
  host: process.env.ServiceBusHost,
  queueName: process.env.ServiceBusQueueName,
  user: process.env.ServiceBusUsername,
  password: process.env.ServiceBusPassword,
  protocol: process.env.ServiceBusProtocol || 'amqps'
}

if (!busConfig.host || !busConfig.queueName || !busConfig.user || !busConfig.password) {
  console.warn('Service Bus connection environment variables are required.')
  process.exit(1)
}

const uri = busConfig.protocol + '://' + encodeURIComponent(busConfig.user) + ':' + encodeURIComponent(busConfig.password) + '@' + busConfig.host
console.log(`connecting to ${busConfig.host}`)

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
    messageSender = sender
    receiver.on('errorReceived', function (rxErr) { console.warn('===> RX ERROR: ', rxErr) })
    receiver.on('message', function (message) {
      console.log('received: ', message.body)
    })
  })
  .error(function (e) {
    console.warn('connection error: ', e)
  })

const send = (message) => {
  return messageSender.send({ DataString: 'From Node', DataValue: message }).then(function (state) {
    // this can be used to optionally track the disposition of the sent message
    console.log('message sent. state: ', state)
  })
}

module.exports = send
