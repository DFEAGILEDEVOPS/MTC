'use strict'
/* global spyOn, describe, it, expect */

const fs = require('fs-extra')

const uploadedFileService = require('../../../services/uploaded-file.service')

describe('uploadedFileService', () => {
  describe('getFilesize', () => {
    it('fetches the file size in KB', async () => {
      spyOn(fs, 'statSync').and.returnValue({ size: 512 })
      const file = 'file'
      const fileSize = await uploadedFileService.getFilesize(file)
      expect(fileSize).toBe(0.5)
    })
  })
})
