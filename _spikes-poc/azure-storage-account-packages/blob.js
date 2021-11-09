'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    // console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const { BlobServiceClient } = require('@azure/storage-blob')
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
const R = require('ramda')

async function main () {
  await createIfNotExists()
}

async function createIfNotExists () {
  const containerName = 'spike-client'
  const containerClient = blobServiceClient.getContainerClient(containerName)
  await containerClient.createIfNotExists()
  const blobFileName = "hello-file.txt"
  const blockClient =  containerClient.getBlockBlobClient(blobFileName)
  const content = "testing blob upload"
  // await blockClient.upload(content, content.length)
  // await blockClient.uploadFile('~/downloads/spike-file.txt')
  // get properties
  const props = await blockClient.getProperties()
  const size = Math.round(R.divide(props.contentLength, 1024) * 100) / 100
  console.log(`the file ${blobFileName} size is ${size}MB`)
}

main()
