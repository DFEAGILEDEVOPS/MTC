const { QueueServiceClient, QueueSASPermissions } = require('@azure/storage-queue');
const queueName = 'spike-66011-bug';
// add dotenv to load environment variables
require('dotenv').config();

async function sendMessage() {
  const queueServiceClient = QueueServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const queueClient = queueServiceClient.getQueueClient(queueName);
  await queueClient.createIfNotExists();
  const permissions = new QueueSASPermissions()
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(startDate.getDate() + 2);
  console.log(`startDate: ${startDate}, endDate: ${endDate}`)
  permissions.add = true
  const sasUrl = queueClient.generateSasUrl({
    permissions,
    startsOn: startDate,
    expiresOn: endDate
  })
  const parts = sasUrl.split('?')
    const tokenObject = {
      token: parts[1],
      url: parts[0],
      queueName
    }
  console.dir(tokenObject)
  const queueSasUrl = buildSasUrlFromToken(tokenObject)
  const newClient = new QueueServiceClient(queueSasUrl)
  const newQueueClient = newClient.getQueueClient(queueName)
  await newQueueClient.sendMessage('Hello, world!');
}

const buildSasUrlFromToken = (token) => {
  return `${token.url.replace(`/${queueName}`, '')}?${token.token}`
}

async function main () {
  try {
    await sendMessage()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
  console.log(`sent message to queue successfully`)
  process.exit(0)
}

main()
  .then(() => {})
  .catch(err => console.error(err))

