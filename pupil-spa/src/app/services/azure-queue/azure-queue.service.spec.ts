import { TestBed, inject } from '@angular/core/testing';

import { AzureQueueService } from './azure-queue.service';

describe('AzureQueueService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AzureQueueService]
    });
  });

  it('should be created', inject([AzureQueueService], (service: AzureQueueService) => {
    expect(service).toBeTruthy();
  }));
});
