'use strict'
/* global describe, it, expect, fail, beforeEach, afterAll */

const os = require('os')
const fs = require('fs-extra')

const sut = require('./mtc-fs-utils')
const mockContext = require('../mock-context')
const dirsToCleanup = []

describe('mtc-fs-utils', () => {
  beforeEach(() => {
    sut.setLogger(mockContext.log)
  })

  afterAll(() => {
    dirsToCleanup.forEach(d => fs.removeSync(d))
  })

  describe('#getDirectoryOrFallback', () => {
    it('returns the supplied path when the path is good', () => {
      try {
        sut.getDirectoryOrFallback(__dirname)
      } catch (error) {
        fail(error)
      }
    })

    it('returns the OS\'s tmp dir if the supplied path is not writeable', async () => {
      const dir = await sut.getDirectoryOrFallback('/usr/sbin')
      expect(dir).toBe(os.tmpdir())
    })

    it('returns the OS\'s tmp dir if the supplied path is not a directory', async () => {
      const dir = await sut.getDirectoryOrFallback(__filename)
      expect(dir).toBe(os.tmpdir())
    })

    it('returns the OS\'s tmp dir if the supplied path is falsey', async () => {
      const dir = await sut.getDirectoryOrFallback(null)
      expect(dir).toBe(os.tmpdir())
    })

    it('returns the OS\'s tmp dir if the supplied path is ""', async () => {
      const dir = await sut.getDirectoryOrFallback('')
      expect(dir).toBe(os.tmpdir())
    })

    it('returns the validated path if happy', async () => {
      const dir = await sut.getDirectoryOrFallback(__dirname)
      expect(dir).toBe(__dirname)
    })
  })

  describe('#validateDirectory', () => {
    it('throws an error if the param is a file', async () => {
      // test setup - skip - we can use a file from this function
      try {
        await sut.validateDirectory(__filename)
        fail()
      } catch (error) {
        expect(error.message).toMatch(/^Not a directory/)
      }
    })

    it('throws an error if the param is not on the filesystem', async () => {
      // test setup - skip - we can use a file from this function
      try {
        await sut.validateDirectory('not-a-real-file.nonsense')
        fail()
      } catch (error) {
        expect(error.message).toMatch(/^ENOENT: no such file or directory/)
        expect(error.code).toBe('ENOENT')
      }
    })

    it('throws an error if the directory is not writeable', async () => {
      // test setup - skip - we can use a file from this function
      try {
        await sut.validateDirectory('/usr/sbin')
        fail()
      } catch (error) {
        expect(error.message).toMatch(/^EPERM: operation not permitted/)
        expect(error.code).toBe('EPERM')
      }
    })

    it('does not throw an error when it works', async () => {
      // test setup - skip - we can use a file from this function
      try {
        await sut.validateDirectory(__dirname)
        expect().nothing()
      } catch (error) {
        fail(error)
      }
    })
  })

  describe('#createDirectory', () => {
    it('creates a dir when given a good path', async () => {
      const dir = await sut.createTmpDir('unit-test-', __dirname)
      expect(dir).toMatch(__dirname)
      dirsToCleanup.push(dir)
    })
    it('creates a dir when given a useless path by falling back to the os tmp dir', async () => {
      const dir = await sut.createTmpDir('unit-test-', '/does/not/exist')
      expect(dir).toMatch(os.tmpdir())
      dirsToCleanup.push(dir)
    })
    it('uses the os tmp dir if the optional path param is not provided', async () => {
      const dir = await sut.createTmpDir('unit-test-')
      expect(dir).toMatch(os.tmpdir())
      dirsToCleanup.push(dir)
    })
  })
})
