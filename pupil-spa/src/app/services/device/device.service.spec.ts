import { TestBed } from '@angular/core/testing';
import { StorageService } from '../storage/storage.service';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { WindowRefService } from '../window-ref/window-ref.service';
import { AppUsageService } from '../app-usage/app-usage.service';


import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let service, storageService, appUsageService;

  beforeEach(() => {
    storageService = new StorageServiceMock();
    const injector = TestBed.configureTestingModule({
      providers: [
        DeviceService,
        {provide: StorageService, useValue: storageService},
        WindowRefService,
        AppUsageService
      ]
    });
    appUsageService = injector.get(AppUsageService);
    service = new DeviceService(
      storageService,
      injector.get(WindowRefService),
      appUsageService
    );
    spyOn(appUsageService, 'getCounterValue');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('captures device info to localStorage',  async () => {
    await service.capture();
    const deviceInfo = storageService.getItem('device');
    expect(appUsageService.getCounterValue).toHaveBeenCalledTimes(1);
    expect(deviceInfo).toBeTruthy();
  });
});
