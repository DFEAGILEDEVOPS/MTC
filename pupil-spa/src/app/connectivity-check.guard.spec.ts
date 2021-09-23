import { TestBed, inject } from '@angular/core/testing'
import { Router } from '@angular/router'
import { ConnectivityCheckGuard } from './connectivity-check.guard'
import {
  APP_CONFIG, loadConfigMockService
} from './services/config/config.service'
import { APP_INITIALIZER } from '@angular/core'

let mockRouter

describe('ConnectivityCheckGuard', () => {
  mockRouter = {
    navigate: jasmine.createSpy('navigate')
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: Router, useValue: mockRouter },
        ConnectivityCheckGuard
      ]
    })
  })

  it('should instantiate', inject([ConnectivityCheckGuard], (guard: ConnectivityCheckGuard) => {
    expect(guard).toBeTruthy()
  }))

  describe('when the connectivity check enabled flag is enabled', () => {
    it('should redirect to connectivity check page', inject([ConnectivityCheckGuard], (guard: ConnectivityCheckGuard) => {
      APP_CONFIG.connectivityCheckEnabled = true
      const result = guard.canActivate()
      expect(mockRouter.navigate).not.toHaveBeenCalledWith()
      expect(result).toBeTruthy()
    }))
  })

  describe('when the connectivity check enabled flag is disabled', () => {
    it('should redirect to sign in page', inject([ConnectivityCheckGuard], (guard: ConnectivityCheckGuard) => {
      APP_CONFIG.connectivityCheckEnabled = false
      const result = guard.canActivate()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sign-in'])
      expect(result).toBeFalsy()
    }))
  })
})
