/*
Create a release annotation via the App insights API
This is necessary due to the limitation of the Azure DevOps build task being windows only 🤨

Script Parameters
=================
1: App Insights Api Application Id
2: App Insights Api Key
3: Release Name
4: Release Description
5: Release Author
*/
const axios = require('axios').default
const yargs = require('yargs').argv
const uuid = require('uuid').v4
const moment = require('moment')

const applicationId = yargs.applicationId
const apiKey = yargs.apiKey
const releaseName = yargs.releaseName
const releaseDescription = yargs.releaseDescription
const author = yargs.releaseAuthor
const eventTime = moment().format('YYYY-MM-DD[T]HH:mm:ss')

const aiServiceUrl = 'https://aigs1.aisvc.visualstudio.com'
const apiUrl = `${aiServiceUrl}/applications/${applicationId}/Annotations?api-version=2015-11`
const requestBody = {
  Id: uuid(),
  AnnotationName: releaseName,
  EventTime: eventTime,
  Category: 'Deployment',
  Properties: {
    ReleaseDescription: releaseDescription,
    TriggerBy: author
  }
}

console.log('request body....')
console.dir(requestBody)
const encodedRequest = Buffer.from(JSON.stringify(requestBody), 'utf-8')

axios({
  method: 'PUT',
  headers: {
    'X-AIAPIKEY': apiKey,
    'Content-Type': 'application/json; charset=utf-8'
  },
  url: apiUrl,
  data: encodedRequest.toString()
}).catch((error) => {
  console.log(`an error occured :-/`)
  console.dir(error.response.data)
}).then((data) => {
  if (data !== undefined) {
    console.log('response...')
    console.dir(data)
  }
})



