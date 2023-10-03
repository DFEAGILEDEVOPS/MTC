import { TestBed } from '@angular/core/testing'
import { HttpService } from '../http/http.service'
import { SubmissionService } from './submission.service'
import { APP_INITIALIZER } from '@angular/core'
import { APP_CONFIG, loadConfigMockService } from '../config/config.service'
import * as exp from 'constants'

describe('submission service', () => {

  let sut: SubmissionService
  let httpServiceSpy: {
    post: jasmine.Spy
  }

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['post'])
    TestBed.configureTestingModule({
      providers: [
        SubmissionService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: HttpService, useValue: httpServiceSpy }
      ]
    })
    .compileComponents()
    sut = TestBed.inject(SubmissionService)
  })

  it('should post to payload url with valid jwt auth header from payload', async () => {
    const payloadJwt = 'my-jwt-token'
    const payloadUrl = 'http://my-url'
    const payload = {
      tokens: {
        checkSubmission: {
          url: payloadUrl,
          token: payloadJwt
        }
      }
    }
    httpServiceSpy.post.and.callFake((url: string, payload: any, headers: any) => {
      expect(headers.get('Authorization')).toEqual(`Bearer ${payloadJwt}`)
      expect(url).toEqual(payloadUrl)
    })
    await sut.submit(payload)
    expect(httpServiceSpy.post).toHaveBeenCalled()
  })

  it('payload should be submitted as JSON', async () => {
    const payload = {
      tokens: {
        checkSubmission: {
          url: 'url',
          token: 'jwt'
        }
      }
    }
    httpServiceSpy.post.and.callFake((url: string, payload: any, headers: any) => {
      expect(headers.get('Content-Type')).toEqual(`application/json`)
    })
    await sut.submit(payload)
    expect(httpServiceSpy.post).toHaveBeenCalled()
  })

  it('should post payload as request body', async () => {
    const payloadUrl = 'http://my-url'
    const payload = {
      tokens: {
        checkSubmission: {
          url: payloadUrl,
          token: 'jwt'
        }
      }
    }
    await sut.submit(payload)
    expect(httpServiceSpy.post).toHaveBeenCalledWith(payloadUrl, payload, jasmine.anything(), jasmine.anything())
  })

  it('should set correct version on payload', async () => {
    const expectedPayloadVersion = 3
    const payloadUrl = 'http://my-url'
    const payload = {
      tokens: {
        checkSubmission: {
          url: payloadUrl,
          token: 'jwt'
        }
      }
    }
    httpServiceSpy.post.and.callFake((url: string, payload: any) => {
      expect(payload.version).toEqual(expectedPayloadVersion)
    })
    await sut.submit(payload)
    expect(httpServiceSpy.post).toHaveBeenCalled()
  })

  it('should use retry count from app config', async () => {
    const payload = {
      tokens: {
        checkSubmission: {
          url: 'url',
          token: 'jwt'
        }
      }
    }
    await sut.submit(payload)
    expect(httpServiceSpy.post).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), jasmine.anything(), APP_CONFIG.checkSubmissionAPIErrorMaxAttempts)
  })

  it('original error should bubble up when submission fails', async () => {
    httpServiceSpy.post.and.throwError(new Error('submission-failed'))
    const payload = {
      tokens: {
        checkSubmission: {
          url: 'url',
          token: 'jwt'
        }
      }
    }
    try {
      await sut.submit(payload)
    } catch (e) {
      expect(e.message).toEqual('submission-failed')
    }
  })
})
