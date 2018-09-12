import { TestBed } from '@angular/core/testing';
import { AzureQueueService } from './azure-queue.service';
import { TokenService } from '../token/token.service';

let azureQueueService: AzureQueueService;

describe('AzureQueueService', () => {
  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
        providers: [
          AzureQueueService,
          TokenService
        ]
      }
    );
    azureQueueService = inject.get(AzureQueueService);
  });
  it('should be created', () => {
    expect(azureQueueService).toBeTruthy();
  });
});
