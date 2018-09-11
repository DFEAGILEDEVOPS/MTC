import { TestBed } from '@angular/core/testing';
import { StorageService } from '../storage/storage.service';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { DeviceService } from '../device/device.service';

import { ConnectionTestService } from './connection-test.service';

describe('ConnectionTestService', () => {
  let service, storageService, deviceService;

  beforeEach(() => {
    storageService = new StorageServiceMock();
    deviceService = {
      getBatteryInformation: jasmine.createSpy('getBatteryInformation'),
    };
    service = new ConnectionTestService(
      storageService,
      deviceService,
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('extracts all info from deviceService',  async () => {
    await service.getTestResults();
    expect(deviceService.getBatteryInformation).toHaveBeenCalled();
  });
});
