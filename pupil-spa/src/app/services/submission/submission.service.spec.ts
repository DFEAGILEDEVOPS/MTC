import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { SubmissionService } from './submission.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';

let mockBackend: MockBackend;
let submissionService: SubmissionService;
let storageService: StorageService;

const shouldNotExecute = () => {
  expect('this code').toBe('not executed');
};

describe('SubmissionService', () => {
  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        SubmissionService,
        { provide: XHRBackend, useClass: MockBackend },
        StorageService,
        AuditService
      ]
    });
    storageService = injector.get(StorageService);
    submissionService = injector.get(SubmissionService);
    mockBackend = injector.get(XHRBackend);
  });

  it('should be created', inject([SubmissionService], (service: SubmissionService) => {
    expect(service).toBeTruthy();
  }));

  it('submitCheckStartData function should call storageService getItem', inject([SubmissionService], (service: SubmissionService) => {
    mockBackend.connections.subscribe((connection) => {
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify({isSaved: true}),
        status: 200
      })));
    });
    spyOn(storageService , 'getItem').and.returnValues({});
    submissionService.submitCheckStartData().then(() => {
      expect(storageService.getItem).toHaveBeenCalledWith('pupil');
      expect(storageService.getItem).toHaveBeenCalledWith('access_token');
    });
  }));

  it('submitData function should call storageService getAllItems', inject([SubmissionService], (service: SubmissionService) => {
    mockBackend.connections.subscribe((connection) => {
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify({isSaved: true}),
        status: 200
      })));
    });
    spyOn(storageService , 'getAllItems').and.returnValues({});
    submissionService.submitData().then(() => {
      expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
    });
  }));

  it('returns error on invalid status code', () => {
    mockBackend.connections.subscribe((connection) => {
      return connection.mockError((new Response(new ResponseOptions({
        body: {
          'error': 'Unauthorised'
        },
        status: 401,
      }))));
    });

    submissionService.submitData().then(
      () => {
        shouldNotExecute();
      },
      (err) => {
        expect(err).toBeTruthy();
      }
    ).catch(() => {
      shouldNotExecute();
    });
  });
});
