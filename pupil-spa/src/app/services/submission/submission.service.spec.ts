import { TestBed } from '@angular/core/testing'
import { HttpService } from '../http/http.service'
import { SubmissionService } from './submission.service'
import { APP_INITIALIZER } from '@angular/core'
import { APP_CONFIG, IAppConfig, loadConfigMockService } from '../config/config.service'

describe('submission service', () => {

  let sut: SubmissionService
  let initialProductionFlag: boolean
  let httpServiceSpy: {
    submit: jasmine.Spy
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
    initialProductionFlag = APP_CONFIG.production
    sut = TestBed.inject(SubmissionService)
  })

  afterEach(() => {
    (<IAppConfig>APP_CONFIG).production = initialProductionFlag
  })
})
