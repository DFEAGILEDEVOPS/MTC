import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { SubmissionService } from './submission.service';
import { StorageService } from '../storage/storage.service';

let mockBackend: MockBackend;
let submissionService: SubmissionService;
let storageService: StorageService;

describe('SubmissionService', () => {
  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        SubmissionService,
        StorageService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });

    submissionService = inject.get(SubmissionService);
    storageService = inject.get(StorageService);
    mockBackend = inject.get(XHRBackend);
  });

  it('should be created', inject([SubmissionService], (service: SubmissionService) => {
    expect(service).toBeTruthy();
  }));

  it('submitData function should call storageService getAllItems', inject([SubmissionService], (service: SubmissionService) => {
    mockBackend.connections.subscribe((connection) => {
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify({isSaved: true}),
        status: 200
      })));
    });
    spyOn(storageService, 'getAllItems');
    submissionService.submitData().then(() => {
      expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
    });
  }));

});
