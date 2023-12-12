'use strict'

const ServiceBus = require('@azure/service-bus')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const globalDotEnvFile = path.join(__dirname, '..', '.env')
try {
  if (fs.existsSync(globalDotEnvFile)) {
    // console.log('globalDotEnvFile found', globalDotEnvFile)
    dotenv.config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

async function main () {
  console.log('main called')
  const busClient = ServiceBus.ServiceBusClient.createFromConnectionString(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING)
  const queueClient = busClient.createQueueClient('check-completion')
  const sender = queueClient.createSender()

  let i = 0
  for (i = 0; i < 100000; i++) {
    console.log('sending message ', i)
    await sender.send({
      body: {
        seq: i
      },
      label: 'test'
    })
  }

  await sender.close()
  await queueClient.close()
  await busClient.close()
}

main()
  .then(() => {
    console.log('all done')
  })
  .catch(error => { console.error(error) })
