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
      getBatteryInformation: jasmine.createSpy('getBatteryInformation').and.returnValue({
        chargingTime: 'Infinity',
        dischargingTime: 2000,
        isCharging: false,
        levelPercent: 28
      }),
      getCpuInformation: jasmine.createSpy('getCpuInformation').and.returnValue({
        hardwareConcurrency: 8
      }),
      getNavigatorProperties: jasmine.createSpy('getNavigatorProperties').and.returnValue({
        userAgent: 'Chrome',
        platform: 'Win32',
        language: 'en-US',
        cookieEnabled: true,
        doNotTrack: null
      }),
      getNetworkInformation: jasmine.createSpy('getNetworkInformation').and.returnValue({
        downlink: 1.55,
        effectiveType: "4g",
        rtt: 50
      }),
      getScreenProperties: jasmine.createSpy('getScreenProperties').and.returnValue({
        screenWidth: 1536,
        screenHeight: 864,
        outerWidth: 1528,
        outerHeight: 344,
        innerWidth: 1514,
        innerHeight: 344,
        colorDepth: 24,
        orientation: "landscape-primary"
      })
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
    expect(deviceService.getCpuInformation).toHaveBeenCalled();
    expect(deviceService.getNavigatorProperties).toHaveBeenCalled();
    expect(deviceService.getNetworkInformation).toHaveBeenCalled();
    expect(deviceService.getScreenProperties).toHaveBeenCalled();

    const testData = await service.getTestResults();

    expect(testData.device.battery.dischargingTime).toBe(2000);
    expect(testData.device.cpu.hardwareConcurrency).toBe(8);
    expect(testData.device.navigator.platform).toBe('Win32');
    expect(testData.device.networkConnection.effectiveType).toBe('4g');
    expect(testData.device.screen.innerWidth).toBe(1514);
  });
});
