import { TestBed } from '@angular/core/testing'
import { AppConfigService } from './config.service'
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { throwError } from 'rxjs/internal/observable/throwError'
import { of } from 'rxjs/internal/observable/of'

describe('AppConfigService', () => {
  let service: AppConfigService
  let http: HttpClient

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        AppConfigService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    service = TestBed.inject(AppConfigService)
    http = TestBed.inject(HttpClient)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('loads data from the config json file', async () => {
    spyOn(http, 'get').and.returnValue(of({}))
    try {
      const loadResult = await service.load()
      expect(loadResult).toBe(true)
    } catch {
      fail()
    }
  })

  it('returns false if the config json file does not exist', async () => {
    spyOn(http, 'get').and.callFake(() => {
      return throwError(() => new HttpErrorResponse({
        error: new Error('Not found'),
        status: 404,
        statusText: 'Not found'
      }))
    })
    const loadResult = await service.load()
    expect(loadResult).toBe(false)
  })
})
