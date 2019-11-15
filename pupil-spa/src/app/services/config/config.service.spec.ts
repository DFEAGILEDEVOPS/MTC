import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { of, throwError } from 'rxjs';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let http: HttpClient;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        AppConfigService
      ]
    });
    service = TestBed.get(AppConfigService);
    http = TestBed.get(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads data from the config json file',  async (done) => {
    spyOn(http, 'get').and.returnValue(of({}));
    try {
      const loadResult = await service.load();
      expect(loadResult).toBe(true);
      done();
    } catch (e) {
      fail();
    }
  });

  it('throws a server error if the config json file does not exist',  async (done) => {
    spyOn(http, 'get').and.returnValue(throwError('error'));
    try {
      const loadResult = await service.load();
      fail();
    } catch (e) {
      done();
    }
  });
});
