const proxyquire = require('proxyquire').noCallThru()
const moment = require('moment')

/* global describe, it, expect, beforeEach, afterEach, jasmine */

describe('monitor.helper', () => {
  let monitor
  let fakeAI
  let fakeConfig
  let testObject
  let monitoredObject

  describe('if AI is enabled', () => {
    beforeEach(() => {
      fakeConfig = { Logging: { ApplicationInsights: { Key: true } } }
      fakeAI = { defaultClient: { trackDependency: jasmine.createSpy() } }
      monitor = proxyquire('../../../helpers/monitor', {
        'applicationinsights': fakeAI,
        '../config': fakeConfig
      })
      testObject = {
        a: function (x) { return x },
        b: (x) => x,
        c: async (x) => Promise.resolve(x),
        d: { test: 1 },
        e: 'test'
      }
      monitoredObject = monitor('type', testObject)
      jasmine.clock().mockDate(moment('2017-09-09 00:00:01').toDate())
    })

    afterEach(() => {
      jasmine.clock().uninstall()
    })

    it('it should call trackDependency for native functions', () => {
      const result = monitoredObject.a(1)
      expect(fakeAI.defaultClient.trackDependency).toHaveBeenCalledWith({
        dependencyTypeName: 'type',
        name: 'a',
        duration: 0
      })
      expect(result).toBe(1)
    })

    it('it should call trackDependency for arrow functions', () => {
      const result = monitoredObject.b(1)
      expect(fakeAI.defaultClient.trackDependency).toHaveBeenCalledWith({
        dependencyTypeName: 'type',
        name: 'b',
        duration: 0
      })
      expect(result).toBe(1)
    })

    it('it should call trackDependency for async functions and return promise', async () => {
      const result = await monitoredObject.c(1)
      expect(fakeAI.defaultClient.trackDependency).toHaveBeenCalledWith({
        dependencyTypeName: 'type',
        name: 'c',
        duration: 0
      })
      expect(result).toBe(1)
    })

    it('it should not call trackDependency for non-functions - objects', () => {
      const result = monitoredObject.d
      expect(fakeAI.defaultClient.trackDependency).toHaveBeenCalledTimes(0)
      expect(result).toEqual({ test: 1 })
    })

    it('it should not call trackDependency for non-functions - native types', () => {
      const result = monitoredObject.e
      expect(fakeAI.defaultClient.trackDependency).toHaveBeenCalledTimes(0)
      expect(result).toBe('test')
    })
  })

  describe('if AI is not enabled', () => {
    beforeEach(() => {
      fakeConfig = { Logging: { ApplicationInsights: { Key: undefined } } }
      fakeAI = { defaultClient: { trackDependency: jasmine.createSpy() } }
      monitor = proxyquire('../../../helpers/monitor', {
        'applicationinsights': fakeAI,
        '../config': fakeConfig
      })
      testObject = {
        a: (x) => x,
        b: { test: 1 }
      }
      monitoredObject = monitor('type', testObject)
    })

    it('it should not call trackDependency for native functions', () => {
      const result = monitoredObject.a(1)
      expect(fakeAI.defaultClient.trackDependency).toHaveBeenCalledTimes(0)
      expect(result).toBe(1)
    })

    it('should return the same instance of the object', () => {
      expect(monitoredObject.b).toBe(testObject.b)
    })
  })
})
