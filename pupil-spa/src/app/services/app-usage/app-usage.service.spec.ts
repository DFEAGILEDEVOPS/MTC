import { TestBed } from '@angular/core/testing'
import { AppUsageService } from './app-usage.service'
import { StorageService } from '../storage/storage.service'

let appUsageService: AppUsageService
let storageService: StorageService

describe('AppUsageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          AppUsageService,
          StorageService,
        ]
      }
    )
    appUsageService = TestBed.inject(AppUsageService)
    storageService = TestBed.inject(StorageService)
  })

  it('should be created', () => {
    expect(appUsageService).toBeTruthy()
  })

  it('should fetch the app usage counter value', () => {
    const counter = appUsageService.getCounterValue()
    expect(counter).toBe(0)
  })

  it('should increment the app usage counter by 1', () => {
    const current = appUsageService.getCounterValue()
    appUsageService.increment()
    const counter = appUsageService.getCounterValue()
    expect(counter).toBe(current + 1)
  })

  it('should store the app usage counter', () => {
    spyOn(storageService, 'getDeviceData')
    spyOn(storageService, 'setDeviceData')
    const current = appUsageService.getCounterValue()
    appUsageService.increment()
    appUsageService.store()
    expect(storageService.setDeviceData).toHaveBeenCalledTimes(1)
    expect(storageService.setDeviceData).toHaveBeenCalledWith({ appUsageCounter: current + 1 })
  })
})
