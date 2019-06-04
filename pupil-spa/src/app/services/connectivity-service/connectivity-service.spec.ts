import { inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { ConnectivityService } from './connectivity-service';
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azureStorage';

let connectivityService;

describe('ConnectivityService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AzureQueueService,
        ConnectivityService,
        { provide: QUEUE_STORAGE_TOKEN }
      ]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    connectivityService = injector.get(ConnectivityService);
  });
  it('should be created', inject([ConnectivityService], (service: ConnectivityService) => {
    expect(service).toBeTruthy();
  }));
  describe('connectivityCheckSucceeded', () => {
    it('should return true if both pupil api ping and test connectivity queue message creation are successful', async () => {
      spyOn(connectivityService, 'canAccessPupilAuthURL').and.returnValue(true);
      spyOn(connectivityService, 'canAccessAzureStorageQueue').and.returnValue(true);
      const result = await connectivityService.connectivityCheckSucceeded();
      expect(result).toBeTruthy();
    });
    it('should return false if both pupil api ping and test connectivity queue message creation are unsuccessful', async () => {
      spyOn(connectivityService, 'canAccessPupilAuthURL').and.returnValue(false);
      spyOn(connectivityService, 'canAccessAzureStorageQueue').and.returnValue(false);
      const result = await connectivityService.connectivityCheckSucceeded();
      expect(result).toBeFalsy();
    });
    it('should return false if pupil api ping is unsuccessful', async () => {
      spyOn(connectivityService, 'canAccessPupilAuthURL').and.returnValue(false);
      spyOn(connectivityService, 'canAccessAzureStorageQueue').and.returnValue(true);
      const result = await connectivityService.connectivityCheckSucceeded();
      expect(result).toBeFalsy();
    });
    it('should return false if test connectivity queue message creation is unsuccessful', async () => {
      spyOn(connectivityService, 'canAccessPupilAuthURL').and.returnValue(false);
      spyOn(connectivityService, 'canAccessAzureStorageQueue').and.returnValue(true);
      const result = await connectivityService.connectivityCheckSucceeded();
      expect(result).toBeFalsy();
    });
  });
});
