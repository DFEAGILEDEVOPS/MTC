#!/usr/bin/env node
'use strict'

const commandLineArgs = require('command-line-args')
const sb = require('@azure/service-bus')
const config = require('../config')
const perf = require('perf_hooks')

const optionDefinitions = [
  { name: 'queue', alias: 'q', type: String },
  { name: 'count', alias: 'c', type: Number }
]

const usage = function () {
  return console.log(`
    Usage: <script> --queue [-q] queue --count [-c] count
    E.g. drain-sb-queue.js -q my-sb-queue -c 1000
    `)
}

async function drainQueue (queueName, count) {
  console.log(`Purging queue ${queueName}`)
  const sbClient = new sb.ServiceBusClient(config.ServiceBus.connectionString)
  const sbReceiver = sbClient.createReceiver(queueName, {
    receiveMode: 'receiveAndDelete'
  })
  console.log(`attempting to receive and delete ${count} messages from ${queueName}...`)
  const start = perf.performance.now()
  await sbReceiver.receiveMessages(count)
  const end = perf.performance.now()
  const duration = end - start
  console.log('queue drain complete in', duration, 'ms')
}

async function main (options) {
  if (!options.queue || !options.count) {
    process.exitCode = 1
    return usage()
  }

  try {
    await drainQueue(options.queue, options.count)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
  console.log(`Purged queue ${options.queue} successfully`)
  process.exit(0)
}

const options = commandLineArgs(optionDefinitions)
main(options)
  .then(() => {})
  .catch(err => console.error(err))
