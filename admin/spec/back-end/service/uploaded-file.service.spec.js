'use strict'

const fs = require('fs-extra')

const uploadedFileService = require('../../../services/uploaded-file.service')

describe('uploadedFileService', () => {
  describe('getFilesize', () => {
    test('fetches the file size in KB', async () => {
      jest.spyOn(fs, 'statSync').mockReturnValue({ size: 512 })
      const file = 'file'
      const fileSize = await uploadedFileService.getFilesize(file)
      expect(fileSize).toBe(0.5)
    })
  })
})
