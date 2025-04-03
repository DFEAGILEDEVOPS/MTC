import { TestBed } from '@angular/core/testing'
import { HttpService } from './http.service'
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { defer } from 'rxjs/internal/observable/defer'

/** Create async observable that emits-once and completes
 *  after a JS engine turn */
export function asyncData<T> (data: T) {
  return defer(() => Promise.resolve(data))
}
/** Create async observable that emits-once and rejects
 *  after a JS engine turn */
export function asyncError<T> (data: T) {
  return defer(() => Promise.reject(data))
}

describe('HttpService', () => {
  let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy, request: jasmine.Spy }
  let httpService: HttpService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpService
      ]
    })
    // Here is how to construct an actual HttpClient instance without DI
    // service = new HttpService(new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() })));
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'request'])
    httpService = new HttpService(httpClientSpy as any)
    spyOn(console, 'error') // service is quite verbose, so reduce the noise.
  })

  it('should be created', () => {
    expect(httpService).toBeTruthy()
  })

  describe('postJson', () => {
    it('returns the http result from a post on success', async () => {
      try {
        const expectedResponse = { checkCode: '1111-2222-3333-4444' }
        httpClientSpy.post.and.returnValue(asyncData(expectedResponse))
        const res = await httpService.postJson('http://localhost', { foo: 'bar' })
        expect(res.checkCode).toBeTruthy()
        expect(httpClientSpy.post).toHaveBeenCalledTimes(1)
      } catch (error) {
        fail(error)
      }
    })

    it('returns the httpErrorResponse from a post on 401 unauthorised, single call only', async () => {
      try {
        httpClientSpy.post.and.returnValue(asyncError(new HttpErrorResponse({
          error: { error: 'Unauthorised' },
          status: 401,
          statusText: 'Unauthorized'
        })))
        await httpService.postJson('http://localhost', { foo: 'bar' })
        fail('Should have thrown')
      } catch (error) {
        expect(error.status).toBe(401)
        expect(error.statusText).toBe('Unauthorized')
        expect(error.error).toEqual({ error: 'Unauthorised' })
        expect(httpClientSpy.post).toHaveBeenCalledTimes(1)
      }
    })

    it('retries if the error code is 408 - Request Timeout', async () => {
      const expectedResponse = { checkCode: '1111-2222-3333-4444' }
      httpClientSpy.post.and
        .returnValues(
          // 1st response
          asyncError(new HttpErrorResponse({
            error: 'Request Timeout',
            status: 408,
            statusText: 'Request Timeout'
          })),
          // 2nd response
          asyncData(expectedResponse)
        )
      const res = await httpService.postJson('http://localhost', { foo: 'bar' })
      expect(res.checkCode).toBeTruthy()
      expect(httpClientSpy.post).toHaveBeenCalledTimes(2)
    })

    it('retries if the error code is 429 - Too many requests', async () => {
      const expectedResponse = { checkCode: '1111-2222-3333-4444' }
      httpClientSpy.post.and
        .returnValues(
          // 1st response
          asyncError(new HttpErrorResponse({
            error: 'Too many requests',
            status: 429,
            statusText: 'Too many requests'
          })),
          // 2nd response
          asyncData(expectedResponse)
        )
      const res = await httpService.postJson('http://localhost', { foo: 'bar' })
      expect(res.checkCode).toBeTruthy()
      expect(httpClientSpy.post).toHaveBeenCalledTimes(2)
    })

    it('retries if the error code is 500 - Server Error', async () => {
      const expectedResponse = { checkCode: '1111-2222-3333-4444' }
      httpClientSpy.post.and
        .returnValues(
          // 1st response
          asyncError(new HttpErrorResponse({
            error: 'Server error',
            status: 500,
            statusText: 'Server error'
          })),
          // 2nd response
          asyncData(expectedResponse)
        )
      const res = await httpService.postJson('http://localhost', { foo: 'bar' })
      expect(res.checkCode).toBeTruthy()
      expect(httpClientSpy.post).toHaveBeenCalledTimes(2)
    })

    it('retries if the error code is 502 - Bad gateway', async () => {
      const expectedResponse = { checkCode: '1111-2222-3333-4444' }
      httpClientSpy.post.and
        .returnValues(
          // 1st response
          asyncError(new HttpErrorResponse({
            error: 'Bad gateway',
            status: 502,
            statusText: 'Bad gateway'
          })),
          // 2nd response
          asyncData(expectedResponse)
        )
      const res = await httpService.postJson('http://localhost', { foo: 'bar' })
      expect(res.checkCode).toBeTruthy()
      expect(httpClientSpy.post).toHaveBeenCalledTimes(2)
    })

    it('retries if the error code is 503 - Service unavailable', async () => {
      const expectedResponse = { checkCode: '1111-2222-3333-4444' }
      httpClientSpy.post.and
        .returnValues(
          // 1st response
          asyncError(new HttpErrorResponse({
            error: 'Service unavailable',
            status: 503,
            statusText: 'Service unavailable'
          })),
          // 2nd response
          asyncData(expectedResponse)
        )
      const res = await httpService.postJson('http://localhost', { foo: 'bar' })
      expect(res.checkCode).toBeTruthy()
      expect(httpClientSpy.post).toHaveBeenCalledTimes(2)
    })

    it('retries if the error code is 504 - Gateway timeout', async () => {
      const expectedResponse = { checkCode: '1111-2222-3333-4444' }
      httpClientSpy.post.and
        .returnValues(
          // 1st response
          asyncError(new HttpErrorResponse({
            error: 'Gateway timeout',
            status: 504,
            statusText: 'Gateway timeout'
          })),
          // 2nd response
          asyncData(expectedResponse)
        )
      const res = await httpService.postJson('http://localhost', { foo: 'bar' })
      expect(res.checkCode).toBeTruthy()
      expect(httpClientSpy.post).toHaveBeenCalledTimes(2)
    })

    it('retries 5 times', async () => {
      const expectedResponse = { checkCode: '1111-2222-3333-4444' }
      httpClientSpy.post.and
        .returnValues(
          // initial request
          asyncError(new HttpErrorResponse({
            error: 'Gateway timeout',
            status: 504,
            statusText: 'Gateway timeout',
            headers: new HttpHeaders({ 'X-jms': (new Date()).toUTCString() })
          })),
          // 1st retry
          asyncError(new HttpErrorResponse({
            error: 'Server error',
            status: 500,
            statusText: 'Server error'
          })),
          // 2nd retry
          asyncError(new HttpErrorResponse({
            error: 'Service Unavailable',
            status: 503,
            statusText: 'Service Unavailable'
          })),
          // 3rd retry
          asyncError(new HttpErrorResponse({
            error: 'Request timeout',
            status: 408,
            statusText: 'Request timeout'
          })),
          // 4th retry
          asyncError(new HttpErrorResponse({
            error: 'Bad gateway',
            status: 502,
            statusText: 'Bad gateway'
          })),
          // 5th retry
          asyncData(expectedResponse)
        )
      const startTime = Date.now()
      const res = await httpService.postJson('http://localhost', { foo: 'bar' })
      const endTime = Date.now()
      expect(res.checkCode).toBeTruthy()
      expect(httpClientSpy.post).toHaveBeenCalledTimes(6)
      // Retry timings are:
      // original call: 0
      // call 1: +100ms
      // call 2: +200
      // call 3: +400
      // call 4: +800
      // call 5: +1600
      expect(endTime - startTime).toBeGreaterThanOrEqual(1600 + 800 + 400 + 200 + 100)
    })

    it('retries if there is a client side error', async () => {
      const expectedResponse = { checkCode: '1111-2222-3333-4444' }
      httpClientSpy.post.and
        .returnValues(
          // 1st response
          asyncError(new HttpErrorResponse({
            error: new ErrorEvent('Connect Failure'),
            status: 400,
            statusText: 'Connect Failure'
          })),
          // 2nd response
          asyncData(expectedResponse)
        )
      const res = await httpService.postJson('http://localhost', { foo: 'bar' })
      expect(res.checkCode).toBeTruthy()
      expect(httpClientSpy.post).toHaveBeenCalledTimes(2)
    })

  })

  describe('postXml', () => {
    const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    beforeAll(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000
    })

    afterAll(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })

    it('tries the default number of times with exponential backoff', async () => {
      httpClientSpy.request.and
        .returnValue(
          asyncError(new HttpErrorResponse({
            error: 'Server error',
            status: 500,
            statusText: 'Server error'
          })),
        )
      const retryCount = 3;
      try {
        await httpService.postXml('http://localhost', '<xml></xml>', new HttpHeaders(), retryCount)
        fail('Should have thrown')
      } catch (error) {
        expect(httpClientSpy.request).toHaveBeenCalledTimes(retryCount + 1);
      }
    })

  }) // end postXml describe
}) // end main describe
