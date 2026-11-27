import { APP_INITIALIZER } from '@angular/core'
import { fakeAsync, TestBed, tick } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { loadConfigMockService } from '../config/config.service'
import { ServiceAvailabilityService } from './service-availability.service'

describe('ServiceAvailabilityService', () => {
  const url = 'http://localhost:3001/pupil-service-availability'
  let service: ServiceAvailabilityService
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    service = TestBed.inject(ServiceAvailabilityService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    http.verify()
  })

  it('allows sign-in when disabled, without sending credentials to the admin app', async () => {
    const result = service.ensureAvailable()
    const request = http.expectOne(url)
    expect(request.request.method).toBe('GET')
    expect(request.request.body).toBeNull()
    expect(request.request.withCredentials).toBeFalse()
    request.flush({ isEnabled: false })
    await expectAsync(result).toBeResolved()
  })

  it('rejects with the holding-page code only when explicitly enabled', async () => {
    const result = service.ensureAvailable()
    http.expectOne(url).flush({ isEnabled: true })
    await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({
      status: 503,
      error: { error: 'Service temporarily unavailable', code: 'EMERGENCY_OFF_SWITCH_ENABLED' }
    }))
  })

  for (const state of [null, {}, { isEnabled: 'false' }]) {
    it(`rejects invalid availability state ${JSON.stringify(state)} rather than assuming off`, async () => {
      const result = service.ensureAvailable()
      http.expectOne(url).flush(state)
      await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({
        status: 503,
        error: { error: 'Invalid service availability response' }
      }))
    })
  }

  for (const status of [401, 503]) {
    it(`treats HTTP ${status} from availability as a service failure, not a credential rejection`, async () => {
      const result = service.ensureAvailable()
      http.expectOne(url).flush({ error: 'Availability failed' }, { status, statusText: 'Unavailable' })
      await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({
        status: 503,
        statusText: 'Unable to check service availability',
        error: jasmine.objectContaining({ status })
      }))
    })
  }

  it('reports a network failure as an availability error', async () => {
    const result = service.ensureAvailable()
    http.expectOne(url).error(new ProgressEvent('error'))
    await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({
      status: 503,
      error: jasmine.objectContaining({ status: 0 })
    }))
  })

  it('times out rather than leaving sign-in indefinitely pending', fakeAsync(() => {
    let failure
    service.ensureAvailable().catch(error => { failure = error })
    const request = http.expectOne(url)
    tick(10_000)
    expect(request.cancelled).toBeTrue()
    expect(failure.status).toBe(503)
    expect(failure.error.name).toBe('TimeoutError')
  }))
})
