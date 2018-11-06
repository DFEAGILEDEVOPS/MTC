import { TestBed, inject } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { HttpModule, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { PupilPrefsService } from './pupil-prefs.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azureStorage';

let azureQueueService: AzureQueueService;
let pupilPrefsService: PupilPrefsService;
let storageService: StorageService;
let tokenService: TokenService;

describe('PupilPrefsService', () => {
  beforeEach(() => {

    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        AppConfigService,
        {provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true},
        {provide: QUEUE_STORAGE_TOKEN},
        AzureQueueService,
        PupilPrefsService,
        StorageService,
        TokenService,
        {provide: XHRBackend, useClass: MockBackend}
      ]
    });
    azureQueueService = injector.get(AzureQueueService);
    pupilPrefsService = injector.get(PupilPrefsService);
    storageService = injector.get(StorageService);
    tokenService = injector.get(TokenService);
  });

  it('should be created', inject([PupilPrefsService], (service: PupilPrefsService) => {
    expect(service).toBeTruthy();
  }));

  describe('storePupilPrefs ', () => {
    let storedPrefsMock;

    beforeEach(() => {
        storedPrefsMock = {
        fontSize: 'large',
        contrast: 'yob'
      };
    });

    it('should call azureQueueService addMessage',
      inject([PupilPrefsService], async (service: PupilPrefsService) => {
        service.featureUseHpa = true;
        spyOn(storageService, 'getItem').and.returnValue(storedPrefsMock);
        spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token'});
        spyOn(azureQueueService, 'addMessage');
        await service.storePupilPrefs();
        expect(tokenService.getToken).toHaveBeenCalled();
        expect(azureQueueService.addMessage).toHaveBeenCalled();
    }));
  });
});
