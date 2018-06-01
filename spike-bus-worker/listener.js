'use strict'

const AMQPClient = require('amqp10').Client
const Policy = require('amqp10').Policy
const winston = require('winston')

let client
const busConfig = {
  host: process.env.ServiceBusHost,
  queueName: process.env.ServiceBusQueueName,
  user: process.env.ServiceBusUsername, // Azure: SASKeyName
  password: process.env.ServiceBusPassword, // Azure: SASKey
  protocol: process.env.ServiceBusProtocol || 'amqps'
}

const messageReceived = (message) => {
  winston.info('received: ', message.body)
  if (message.annotations) winston.info('annotations: ', message.annotations)
}

const init = async () => {
  if (!busConfig.host || !busConfig.queueName || !busConfig.user || !busConfig.password) {
    winston.error('Service Bus connection details are required.')
    process.exit(1)
  }

  const uri = busConfig.protocol + '://' + encodeURIComponent(busConfig.user) + ':' + encodeURIComponent(busConfig.password) + '@' + busConfig.host
  winston.info(`connecting to ${busConfig.host}...`)
  client = new AMQPClient(Policy.ServiceBusQueue)
  try {
    await client.connect(uri)
    winston.info('connected')
  } catch (error) {
    winston.error(`failed to connect...\n`, error)
  }
}

const send = () => {
  winston.error('send not implemented')
}

const listen = async () => {
  if (!client) {
    await init()
  }
  try {
    const receiver = await client.createReceiver(busConfig.queueName)
    receiver.on('errorReceived', function (rxErr) { winston.error('===> RX ERROR: ', rxErr) })
    receiver.on('message', messageReceived)
    winston.info(`listening for messages on ${busConfig.queueName}...`)
  } catch (error) {
    winston.error(`error setting up message receiver...\n`, error)
  }
}

module.exports = {init, listen, send}
