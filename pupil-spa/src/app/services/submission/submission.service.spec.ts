import { TestBed } from '@angular/core/testing'
import { HttpService } from '../http/http.service'
import { SubmissionService } from './submission.service'
import { APP_INITIALIZER } from '@angular/core'
import { APP_CONFIG, IAppConfig, loadConfigMockService } from '../config/config.service'

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

  it('original error should bubble up when submission fails', async () => {
    httpServiceSpy.post.and.throwError(new Error('submission-failed'))
    try {
      await sut.submit('payload', 'url', 'token')
    } catch (e) {
      expect(e.message).toEqual('submission-failed')
    }
  })
})
