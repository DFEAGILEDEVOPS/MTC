#!/usr/bin/env node
'use strict'

const commandLineArgs = require('command-line-args')
const sb = require('@azure/service-bus')
const config = require('../config')

const optionDefinitions = [
  { name: 'queue', alias: 'q', type: String },
  { name: 'count', alias: 'c', type: Number }
]

const usage = function () {
  return console.log(`
    Usage: <script> --queue [-q] queue --count [-c] count
    E.g. fill-sb-queue.js -q my-sb-queue -c 1000
    `)
}

async function fillQueue (queueName, count) {
  console.log(`filling queue ${queueName}`)
  const sbClient = new sb.ServiceBusClient(config.ServiceBus.connectionString)
  const sbSender = sbClient.createSender(queueName)
  console.log(`attempting to send ${count} messages to ${queueName}...`)
  const numbers = Array.from(Array(count).keys())
  const messages = numbers.map((n) => {
    return {
      body: {
        messageNumber: n
      }
    }
  })
  await sbSender.sendMessages(messages)
}

async function main (options) {
  if (!options.queue || !options.count) {
    process.exitCode = 1
    return usage()
  }

  if (options.count > 4500) {
    options.count = 4500
    console.warn('Warning: Azure Service Bus has a limit of 4500 messages per operation. capping at 4500...')
  }

  try {
    await fillQueue(options.queue, options.count)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
  console.log(`added ${options.count} messages to ${options.queue} queue successfully`)
  process.exit(0)
}

const options = commandLineArgs(optionDefinitions)
main(options)
  .then(() => {})
  .catch(err => console.error(err))
