import { TestBed } from '@angular/core/testing'

import { DateTimeService } from './date-time.service'
import { WindowRefService } from '../window-ref/window-ref.service'

describe('DateTimeService', () => {
  let service: DateTimeService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WindowRefService
      ]
    })
    service = TestBed.inject(DateTimeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
