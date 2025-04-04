#!/usr/bin/env node
'use strict'

const commandLineArgs = require('command-line-args')
const sb = require('@azure/service-bus')
const config = require('../config')
const perf = require('perf_hooks')

const optionDefinitions = [
  { name: 'queue', alias: 'q', type: String }
]

const usage = function () {
  return console.log(`
    Usage: <script> --queue [-q] queue
    E.g. drain-sb-queue.js -q my-sb-queue
    `)
}

async function drainQueue (queueName) {
  console.log(`Purging queue ${queueName}`)
  const sbClient = new sb.ServiceBusClient(config.ServiceBus.connectionString)
  const adminClient = new sb.ServiceBusAdministrationClient(config.ServiceBus.connectionString)
  const queueRuntimeProperties = await adminClient.getQueueRuntimeProperties(queueName)
  const meta = {
    activeMessageCount: queueRuntimeProperties.activeMessageCount,
    deadLetterMessageCount: queueRuntimeProperties.deadLetterMessageCount
  }
  const sbReceiver = sbClient.createReceiver(queueName, {
    receiveMode: 'receiveAndDelete'
  })
  const count = meta.activeMessageCount
  console.log(`attempting to receive and delete ${count} messages from ${queueName}...`)
  const start = perf.performance.now()
  await sbReceiver.receiveMessages(count)
  const end = perf.performance.now()
  const duration = end - start
  console.log('queue drain complete in', duration, 'ms')
}

async function main (options) {
  if (!options.queue) {
    process.exitCode = 1
    return usage()
  }

  try {
    await drainQueue(options.queue)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
  console.log(`Drained queue ${options.queue} successfully`)
  process.exit(0)
}

const options = commandLineArgs(optionDefinitions)
main(options)
  .then(() => {
    // do nothing
  })
  .catch(err => console.error(err))
