import { TestBed } from '@angular/core/testing'
import { HttpService } from '../http/http.service'
import { SubmissionService } from './submission.service'
import { APP_INITIALIZER } from '@angular/core'
import { APP_CONFIG, loadConfigMockService } from '../config/config.service'
import { CompressorService } from '../compressor/compressor.service'
import { ApplicationInsightsService } from '../app-insights/app-insights.service'

describe('submission service', () => {
  let sut: SubmissionService
  let httpServiceSpy: {
    post: jasmine.Spy
  }
  let appInsightsServiceSpy: {
    trackTrace: jasmine.Spy
  }

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['post'])
    appInsightsServiceSpy= jasmine.createSpyObj('ApplicationInsightsService', ['trackTrace'])
    TestBed.configureTestingModule({
      providers: [
        SubmissionService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: ApplicationInsightsService, useValue: appInsightsServiceSpy }
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
      },
      checkCode: 'check-code',
      school: {
        uuid: 'school-uuid'
      }
    }
    httpServiceSpy.post.and.callFake((url: string, payload: any, headers: any) => {
      expect(headers.get('Authorization')).toEqual(`Bearer ${payloadJwt}`)
      expect(url).toEqual(payloadUrl)
    })
    await sut.submit(payload)
    expect(httpServiceSpy.post).toHaveBeenCalled()
  })

  it('http content type should be set to JSON', async () => {
    const payload = {
      tokens: {
        checkSubmission: {
          url: 'url',
          token: 'jwt'
        }
      },
      checkCode: 'check-code',
      school: {
        uuid: 'school-uuid'
      }
    }
    httpServiceSpy.post.and.callFake((url: string, payload: any, headers: any) => {
      expect(headers.get('Content-Type')).toEqual(`application/json`)
    })
    await sut.submit(payload)
    expect(httpServiceSpy.post).toHaveBeenCalled()
  })

  it('should post payload as base64 compressed message', async () => {
    const payloadUrl = 'http://my-url'
    const payload = {
      tokens: {
        checkSubmission: {
          url: payloadUrl,
          token: 'jwt'
        }
      },
      checkCode: 'check-code',
      school: {
        uuid: 'school-uuid'
      }
    }
    const stringifiedPayload = JSON.stringify(payload)
    const compressedPayload = CompressorService.compressToGzip(stringifiedPayload)
    const expectedPostBody = {
      archive: compressedPayload,
      version: SubmissionService.SubmittedCheckVersion4,
      checkCode: payload.checkCode,
      schoolUUID: payload.school.uuid
    }
    await sut.submit(payload)
    expect(httpServiceSpy.post).toHaveBeenCalledWith(payloadUrl, expectedPostBody, jasmine.anything(), jasmine.anything())
  })

  it('should set correct attributes on posted Http body', async () => {
    const expectedPayloadVersion = SubmissionService.SubmittedCheckVersion4
    const payloadUrl = 'http://my-url'
    const payload = {
      checkCode: 'check-code',
      school: {
        uuid: 'school-uuid'
      },
      tokens: {
        checkSubmission: {
          url: payloadUrl,
          token: 'jwt'
        }
      }
    }
    httpServiceSpy.post.and.callFake((url: string, postBody: any) => {
      const jsonPayload = CompressorService.decompressFromGzip(postBody.archive)
      //const jsonPayload = JSON.parse(stringifiedPayload)
      expect(postBody.version).toEqual(expectedPayloadVersion)
      expect(postBody.checkCode).toEqual(payload?.checkCode)
      expect(postBody.schoolUUID).toEqual(payload?.school?.uuid)
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
      },
      checkCode: 'check-code',
      school: {
        uuid: 'school-uuid'
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
      },
      checkCode: 'check-code',
      school: {
        uuid: 'school-uuid'
      }
    }
    try {
      await sut.submit(payload)
    } catch (e) {
      expect(e.message).toEqual('submission-failed')
    }
  })
})
