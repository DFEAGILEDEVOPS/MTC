import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { SubmissionService } from './submission.service';
import { StorageService } from '../storage/storage.service';

describe('SubmissionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [SubmissionService, StorageService]
    });
  });

  it('should be created', inject([SubmissionService], (service: SubmissionService) => {
    expect(service).toBeTruthy();
  }));
});
