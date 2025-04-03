import { TestBed } from '@angular/core/testing'

import { AnswerService } from './answer.service'
import { AuditService } from '../audit/audit.service'
import { AuditServiceMock } from '../audit/audit.service.mock'
import { IWindowRefService, WindowRefService } from '../window-ref/window-ref.service'
import { MockWindowRefService } from '../window-ref/mock-window-ref.service'
import { MonotonicTime } from '../../monotonic-time'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { StorageService } from '../storage/storage.service'
import { StorageServiceMock } from '../storage/mock-storage.service'

let service: AnswerService
let storageService: StorageService
let monotonicTimeService: MonotonicTimeService
let mockWindowRefService: IWindowRefService

describe('AnswerService', () => {
  const toPoJo = (answer) => JSON.parse(JSON.stringify(answer))
  const mockDate = new Date('1970-01-01T09:00:00.000Z')

  beforeEach(() => {

    jasmine.clock().mockDate(mockDate)
    mockWindowRefService = new MockWindowRefService(mockDate)
    const injector = TestBed.configureTestingModule({
      providers: [
        AnswerService,
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: WindowRefService, useValue: mockWindowRefService },
        MonotonicTimeService
      ]
    })
    storageService = injector.inject(StorageService)
    monotonicTimeService = injector.inject(MonotonicTimeService)
    service = new AnswerService(storageService, monotonicTimeService)
  })

  afterEach(() => {
    jasmine.clock().uninstall()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('constructs the answer object', () => {
    const setAnswerSpy = spyOn(storageService, 'setAnswer')
    service.setAnswer(1, 2, '3', 25)
    const answerArg = setAnswerSpy.calls.allArgs()[0][0]
    expect(answerArg.answer).toBe('3')
    expect(answerArg.factor1).toBe(1)
    expect(answerArg.factor2).toBe(2)
    expect(answerArg.question).toBe('1x2')
    expect(answerArg.clientTimestamp.toISOString()).toBe('1970-01-01T09:00:00.000Z')
    expect(answerArg.sequenceNumber).toBe(25)
    expect(answerArg.monotonicTime.legacyDate.toISOString()).toBe('1970-01-01T09:00:00.000Z')
  })
})
