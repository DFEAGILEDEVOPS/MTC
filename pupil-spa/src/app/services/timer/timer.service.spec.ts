import { TestBed } from '@angular/core/testing'
import { TimerService, CHECK_TIMEOUT_EVENT } from './timer.service'
import { WindowRefService } from '../window-ref/window-ref.service'
import { QuestionService } from '../question/question.service'
import { StorageService } from '../storage/storage.service'
import { StorageServiceMock } from '../storage/mock-storage.service'

describe('TimerService', () => {
  let service: TimerService
  let mockStorageService
  const mockQuestionService = {
    getConfig: () => ({ checkTime: 10 })
  }
  const tenMinutesInMilliseconds = 10 * 60 * 1000

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        TimerService,
        { provide: QuestionService, useValue: mockQuestionService },
        { provide: StorageService, useClass: StorageServiceMock },
        WindowRefService,
      ]
    })

    service = injector.inject(TimerService)
    mockStorageService = injector.inject(StorageService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
    expect(service.timeRemaining).toBeUndefined()
  })

  it('should start the timer and set time remaining', () => {
    spyOn(window, 'setInterval').and.callThrough()
    // pre-test
    expect(service.timeRemaining).toBeUndefined()
    // exec
    service.startCheckTimer()
    // test - allow ten minutes, or ten minutes minus 1 ms
    expect(service.timeRemaining).toBeGreaterThanOrEqual(tenMinutesInMilliseconds - 1) // Allow an extra ms
    expect(service.timeRemaining).toBeLessThanOrEqual(tenMinutesInMilliseconds)
    expect(window.setInterval).toHaveBeenCalledTimes(1)
    // clean up
    service.stopCheckTimer()
  })

  it('should not start a new timer if already started', () => {
    service.startCheckTimer()
    spyOn(window, 'setInterval').and.callThrough()
    service.startCheckTimer()
    expect(window.setInterval).not.toHaveBeenCalled()
    service.stopCheckTimer()
  })

  it('should load the timer from local storage', () => {
    const t = new Date().getTime()
    spyOn(mockStorageService, 'getCheckStartTime').and.returnValue(`${t}`)
    service.startCheckTimer()
    expect(mockStorageService.getCheckStartTime).toHaveBeenCalledTimes(1)
    expect(Math.abs(service.timeRemaining - tenMinutesInMilliseconds)).toBeLessThan(12)
    service.stopCheckTimer()
  })

  it('should clear timer from local storage', () => {
    spyOn(mockStorageService, 'removeCheckStartTime')
    service.clearStartTime()
    expect(mockStorageService.removeCheckStartTime).toHaveBeenCalledTimes(1)
  })

  it('should stop the timer and clear the interval', () => {
    spyOn(window, 'clearInterval').and.callThrough()
    service.startCheckTimer()
    service.stopCheckTimer()
    expect(window.clearInterval).toHaveBeenCalledTimes(1)
  })

  it('should start the timer and emit timeout event', async () => {
    const t = new Date().getTime()
    spyOn(mockStorageService, 'getCheckStartTime').and.returnValue(`${t - tenMinutesInMilliseconds}`)
    service.emitter.emit = jasmine.createSpy('emit')
    service.startCheckTimer()
    expect(service.emitter.emit).toHaveBeenCalledWith(CHECK_TIMEOUT_EVENT)
    service.stopCheckTimer()
  })
})
