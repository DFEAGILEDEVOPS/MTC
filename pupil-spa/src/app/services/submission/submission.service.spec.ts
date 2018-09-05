import { TestBed, inject } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { XHRBackend } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { MockBackend } from '@angular/http/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import { SubmissionService } from './submission.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { AppUsageService} from '../app-usage/app-usage.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';

let mockBackend: MockBackend;
let submissionService: SubmissionService;
let storageService: StorageService;

describe('SubmissionService', () => {
  let http: HttpClient;
  let service: SubmissionService;
  let auditService: AuditService;
  let appUsageService: AppUsageService;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        AppConfigService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        SubmissionService,
        { provide: XHRBackend, useClass: MockBackend },
        StorageService,
        AuditService,
        AppUsageService
      ]
    });
    storageService = injector.get(StorageService);
    auditService = injector.get(AuditService);
    submissionService = TestBed.get(SubmissionService);
    appUsageService = TestBed.get(AppUsageService);
    mockBackend = injector.get(XHRBackend);
    service = TestBed.get(SubmissionService);
    service.checkStartAPIErrorDelay = 10;
    service.checkStartAPIErrorMaxAttempts = 3;
    service.checkSubmissionApiErrorDelay = 10;
    service.checkSubmissionAPIErrorMaxAttempts = 4;
    http = TestBed.get(HttpClient);
  });

  it('should be created', inject([SubmissionService], () => {
    expect(service).toBeTruthy();
  }));
  it( 'submitCheckStartData returns response when successful', async (done) => {
    spyOn(storageService, 'getItem').and.callFake((arg) => {
      if (arg === 'pupil') {
        return { checkCode: null };
      } else {
        return null;
      }
    });
    spyOn(http, 'post').and.returnValue(Observable.of('ok'));
    spyOn(auditService, 'addEntry').and.returnValue({});
    service.submitCheckStartData().subscribe(res => {
        expect(storageService.getItem).toHaveBeenCalledTimes(2);
        expect(storageService.getItem).toHaveBeenCalledWith('pupil');
        expect(storageService.getItem).toHaveBeenCalledWith('access_token');
        expect(auditService.addEntry).toHaveBeenCalledTimes(0);
        expect(res).toEqual('ok');
        done();
      },
      (error) => {}
    );
  });
  it( 'submitCheckStartData retries until the max threshold attempts have been reached', async (done) => {
    spyOn(storageService, 'getItem').and.callFake((arg) => {
      if (arg === 'pupil') {
        return { checkCode: null };
      } else {
        return null;
      }
    });
    spyOn(http, 'post').and.returnValue(Observable.throw({status: 503}));
    spyOn(auditService, 'addEntry').and.returnValue({});
    service.submitCheckStartData().subscribe(res => {},
      (error) => {
        expect(storageService.getItem).toHaveBeenCalledTimes(2);
        expect(storageService.getItem).toHaveBeenCalledWith('pupil');
        expect(storageService.getItem).toHaveBeenCalledWith('access_token');
        expect(auditService.addEntry).toHaveBeenCalledTimes(4);
        expect(error.message).toEqual('Max 3 retries reached');
        done();
      });
  });
  it( 'submitData returns response when successful', async (done) => {
    spyOn(storageService , 'getAllItems').and.returnValues({ device: {} });
    spyOn(appUsageService , 'getCounterValue');
    spyOn(http, 'post').and.returnValue(Observable.of('ok'));
    spyOn(auditService, 'addEntry').and.returnValue({});
    service.submitData().subscribe(res => {
        expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
        expect(appUsageService.getCounterValue).toHaveBeenCalledTimes(1);
        expect(auditService.addEntry).toHaveBeenCalledTimes(0);
        expect(res).toEqual('ok');
        done();
      },
      (error) => {}
      );
  });
  it( 'submitData retries until the max threshold attempts have been reached', async (done) => {
    spyOn(storageService , 'getAllItems').and.returnValues({ device: {} });
    spyOn(appUsageService , 'getCounterValue');
    spyOn(http, 'post').and.returnValue(Observable.throw({status: 503}));
    spyOn(auditService, 'addEntry').and.returnValue({});
    service.submitData().subscribe(res => {},
      (error) => {
        expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
        expect(error.message).toEqual('Max 4 retries reached');
        expect(auditService.addEntry).toHaveBeenCalledTimes(5);
        done();
      });
  });
});
