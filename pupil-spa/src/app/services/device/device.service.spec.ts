import { TestBed } from '@angular/core/testing'
import { StorageService } from '../storage/storage.service'
import { WindowRefService } from '../window-ref/window-ref.service'
import { CookieService } from 'ngx-cookie-service'

import { DeviceService } from './device.service'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('DeviceService', () => {
  let service, storageService, windowRefService, cookieService: CookieService

  beforeEach(() => {
    const windowRefServiceMock = {
      nativeWindow: {
        navigator: {
          userAgent: ''
        },
        screen: {},
        localStorage: {
          getItem: (item) => undefined,
          setItem: (key, val) => undefined
        }
      }
    }
    const injector = TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA], // we don't need to test sub-components
      providers: [
        DeviceService,
        StorageService,
        { provide: WindowRefService, useValue: windowRefServiceMock },
        CookieService
      ]
    })
    storageService = injector.inject(StorageService)
    windowRefService = injector.inject(WindowRefService)
    cookieService = injector.inject(CookieService)
    service = new DeviceService(
      storageService,
      injector.inject(WindowRefService),
      cookieService
    )
    spyOn(console, 'error').and.callThrough()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('captures device info to localStorage', async () => {
    // test setup
    service.deleteDeviceCookie()
    service.setupDeviceCookie()

    // exec
    await service.capture()

    // tests
    const deviceInfo = storageService.getDeviceData()
    expect(deviceInfo).toBeDefined()
    expect(deviceInfo.deviceId.length).toBe(36) // uuid as string

    // reset
    service.deleteDeviceCookie()
  })

  describe('isUnsupportedBrowser', () => {
    beforeEach(() => {
      windowRefService.nativeWindow.navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari/537.36'
    })
    it('returns true when browser is IE9', () => {
      windowRefService.nativeWindow.navigator.userAgent = 'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)'
      const isUnsupportedBrowser = service.isUnsupportedBrowser()
      expect(isUnsupportedBrowser).toBeTruthy()
    })
    it('returns true when browser is IE10', () => {
      windowRefService.nativeWindow.navigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)'
      const isUnsupportedBrowser = service.isUnsupportedBrowser()
      expect(isUnsupportedBrowser).toBeTruthy()
    })
    it('returns true when browser is IE11', () => {
      windowRefService.nativeWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko'
      const isUnsupportedBrowser = service.isUnsupportedBrowser()
      expect(isUnsupportedBrowser).toBeTruthy()
    })
    it('returns false when browser is Edge version 80.0.361.62', () => {
      windowRefService.nativeWindow.navigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36 Edg/80.0.361.62'
      const isUnsupportedBrowser = service.isUnsupportedBrowser()
      expect(isUnsupportedBrowser).toBeFalsy()
    })
    it('returns false when browser is Firefox 74', () => {
      windowRefService.nativeWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/74.0'
      const isUnsupportedBrowser = service.isUnsupportedBrowser()
      expect(isUnsupportedBrowser).toBeFalsy()
    })
    it('returns false when browser is Safari 605.1.15', () => {
      windowRefService.nativeWindow.navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
      const isUnsupportedBrowser = service.isUnsupportedBrowser()
      expect(isUnsupportedBrowser).toBeFalsy()
    })
    it('returns false when browser is Chrome version 80.0.3987.149', () => {
      windowRefService.nativeWindow.navigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
      const isUnsupportedBrowser = service.isUnsupportedBrowser()
      expect(isUnsupportedBrowser).toBeFalsy()
    })
  })

  describe('setupDeviceCookie', () => {
    let setCookieSpy: jasmine.Spy
    beforeEach(() => {
      spyOn(service['cookieService'], 'check')
      setCookieSpy = spyOn(service['cookieService'], 'set')
    })

    it('calls cookieService.check to see if there is an existing cookie', () => {
      service.setupDeviceCookie()
      expect(service['cookieService'].check).toHaveBeenCalledTimes(1)
    })

    it('calls cookieService.set to set or refresh the cookie', () => {
      service.setupDeviceCookie()
      expect(service['cookieService'].set).toHaveBeenCalledTimes(1)
    })

    it('sets the cookie args correctly', () => {
      // setup
      const now = new Date()

      // run
      service.setupDeviceCookie()

      // test setup
      const args = setCookieSpy.calls.mostRecent().args

      // Check the cookie name is set correctly
      expect(args[0]).toBe('mtc_device')

      // Cookie expiration time check - should be 4 weeks
      const cookieExpiration = new Date(args[2]['expires'])
      const diff = Math.abs(cookieExpiration.getTime() - now.getTime() - 2419200000) // should be zero
      expect(Math.abs(diff)).toBeLessThan(10 * 1000) // Allow 10 seconds out
    })
  })

  describe('getDeviceId', () => {
    it('calls the cookieService to get the deviceId of the cookie', () => {
      spyOn(service['cookieService'], 'get')
      service.getDeviceId()
      expect(service['cookieService'].get).toHaveBeenCalledWith('mtc_device')
    })

    it('returns null if the cookie is not found', () => {
      spyOn(service['cookieService'], 'get').and.returnValue(undefined)
      const res = service.getDeviceId()
      expect(res).toBeNull()
    })
  })

  describe('isLocalStorageEnabled', () => {
    it('returns false if the localStorage property is not on the Window', () => {
      delete windowRefService.nativeWindow.localStorage
      expect(service.isLocalStorageEnabled()).toBe(false)
      expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching('LS01:'))
    })

    it('returns false if the localStorage setItem property is not on the Window', () => {
      delete windowRefService.nativeWindow.localStorage.setItem
      expect(service.isLocalStorageEnabled()).toBe(false)
    })

    it('returns false if the localStorage getItem property is not on the Window', () => {
      delete windowRefService.nativeWindow.localStorage.getItem
      expect(service.isLocalStorageEnabled()).toBe(false)
    })

    it('returns false if a key cannot be set', () => {
      spyOn(windowRefService.nativeWindow.localStorage, 'setItem').and.callFake(() => { throw new Error('mock error: local storage is' +
        ' disabled' ) })
      expect(service.isLocalStorageEnabled()).toBe(false)
      expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching('LS03:'))
    })

    it('returns false if a key cannot be read', () => {
      spyOn(windowRefService.nativeWindow.localStorage, 'getItem').and.callFake(() => { throw new Error('mock error: local storage is' +
        ' disabled' ) })
      expect(service.isLocalStorageEnabled()).toBe(false)
      expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching('LS04:'))
    })

    it('returns false if local storage is unreliable', () => {
      spyOn(windowRefService.nativeWindow.localStorage, 'getItem').and.returnValue('some wrong value')
      expect(service.isLocalStorageEnabled()).toBe(false)
      expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching('LS05:'))
    })

    it('returns true if it can set and read a value correctly', () => {
      let itemValue = ''
      let itemKey = ''
      spyOn(windowRefService.nativeWindow.localStorage, 'setItem').and.callFake((key, val) => {
        itemValue = val
        itemKey = key
      })
      spyOn(windowRefService.nativeWindow.localStorage, 'getItem').and.callFake(key => {
        if (key === itemKey) { return itemValue }
        return 'error'
      })
      expect(service.isLocalStorageEnabled()).toBe(true)
    })
  })
})
