import { TestBed } from '@angular/core/testing';
import { StorageService } from '../storage/storage.service';
import { WindowRefService } from '../window-ref/window-ref.service';

import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let service, storageService;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        DeviceService,
        StorageService,
        WindowRefService,
      ]
    });
    storageService = injector.get(StorageService);
    service = new DeviceService(
      storageService,
      injector.get(WindowRefService)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('captures device info to localStorage',  async () => {
    await service.capture();
    const deviceInfo = storageService.getDeviceData();
    expect(deviceInfo).toBeTruthy();
  });
});
