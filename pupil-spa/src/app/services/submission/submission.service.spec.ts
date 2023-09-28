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

  it('should post with valid jwt auth header', async () => {
    const jwt = 'my-jwt-token'
    httpServiceSpy.post.and.callFake((url: string, payload: any, headers: any) => {
      expect(headers.get('Authorization')).toEqual(`Bearer ${jwt}`)
    })
    await sut.submit('payload', 'url', jwt)
    expect(httpServiceSpy.post).toHaveBeenCalled()
  })

  xit('todo: verify content type')

  it('original error should bubble up when submission fails', async () => {
    httpServiceSpy.post.and.throwError(new Error('submission-failed'))
    try {
      await sut.submit('payload', 'url', 'token')
    } catch (e) {
      expect(e.message).toEqual('submission-failed')
    }
  })
})
