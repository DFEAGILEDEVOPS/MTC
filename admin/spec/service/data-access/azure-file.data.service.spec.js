'use strict'
/* global describe, it, expect */

const { azureDownloadFile, azureUploadFile } = require('../../../services/data-access/azure-file.data.service')

describe('azure-file.data.service', () => {
  it('will upload data stream to azure blob storage and return an object with name as property', async () => {
    const remoteFilename = 'error.csv'
    const streamLength = 512 * 1000
    const csvStr = 'First name,Middle name(s),Last name,UPN,Date of Birth,Gender,Errors\n' +
      'John,Lawrence,Smith,L822200014001,5/22/1005,M,"Please check ""Year"", More than 1 pupil record with same UPN"\n' +
      'Maria,Stella,Brown,A8222000140021,7/15/2005,F,UPN invalid (character 13 not a recognised value)'
    const blobFile = await azureUploadFile('csvuploads', remoteFilename, csvStr, streamLength)
    console.log(blobFile)
    expect(blobFile).toBeDefined()
    expect(blobFile.name).toBeDefined()
  })

  it('will download a file from azure blob storage and expect it to have content', async () => {
    const csvErrorFile = 'error.csv'
    const blobFile = await azureDownloadFile('csvuploads', csvErrorFile)
    console.log(blobFile)
    expect(blobFile).toBeDefined()
    expect(blobFile.length).toBeGreaterThan(0)
  })
})
