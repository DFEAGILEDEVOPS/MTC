import { TestBed } from '@angular/core/testing';
import { XHRBackend } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import { AzureQueueServiceMock } from '../azure-queue/azure-queue.service.mock';
import { DeviceService } from '../device/device.service';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { APP_CONFIG } from '../../services/config/config.service';

import { ConnectionTestService } from './connection-test.service';

describe('ConnectionTestService', () => {
  let service, storageService, deviceService, queueService, http, router, windowRefService;

  beforeEach(() => {
    storageService = new StorageServiceMock();
    queueService = new AzureQueueServiceMock();
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
        effectiveType: '4g',
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
        orientation: 'landscape-primary',
      }),
      getLocalStorageStatus: jasmine.createSpy('getLocalStorageStatus').and.returnValue(true)
    };
    http = {
      get: jasmine.createSpy('get').and.returnValue(Observable.of({
        headers: {
          keys: () => ['content-length'],
          get: () => 1,
        }
      })),
    };
    router = {
      navigate: jasmine.createSpy('navigate'),
    };
    windowRefService = {
      nativeWindow: {
        setTimeout: jasmine.createSpy('setTimeout'),
        clearTimeout: jasmine.createSpy('clearTimeout'),
      }
    };
    service = new ConnectionTestService(
      http,
      router,
      storageService,
      deviceService,
      queueService,
      windowRefService,
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('extracts all info from deviceService',  async () => {
    service.processingTime = 1;
    service.connectionSpeed = 2;

    const testData = await service.getTestResults();

    expect(deviceService.getBatteryInformation).toHaveBeenCalled();
    expect(deviceService.getCpuInformation).toHaveBeenCalled();
    expect(deviceService.getNavigatorProperties).toHaveBeenCalled();
    expect(deviceService.getNetworkInformation).toHaveBeenCalled();
    expect(deviceService.getScreenProperties).toHaveBeenCalled();
    expect(deviceService.getLocalStorageStatus).toHaveBeenCalled();

    expect(testData).toEqual({
      device: {
        battery: {
          chargingTime: 'Infinity',
          dischargingTime: 2000,
          isCharging: false,
          levelPercent: 28
        },
        cpu: {
          hardwareConcurrency: 8
        },
        navigator: {
          userAgent: 'Chrome',
          platform: 'Win32',
          language: 'en-US',
          cookieEnabled: true,
          doNotTrack: null
        },
        networkConnection: {
          downlink: 1.55,
          effectiveType: '4g',
          rtt: 50
        },
        screen: {
          screenWidth: 1536,
          screenHeight: 864,
          outerWidth: 1528,
          outerHeight: 344,
          innerWidth: 1514,
          innerHeight: 344,
          colorDepth: 24,
          orientation: 'landscape-primary'
        },
        localStorageEnabled: true
      },
      processingTime: 1,
      connectionSpeed: 2
    });
  });

  describe('#startTest', () => {
    beforeEach(() => {
      spyOn(service, 'benchmarkProcessing').and.returnValue(Promise.resolve(true));
      spyOn(service, 'benchmarkConnection').and.returnValue(Promise.resolve(true));
      spyOn(service, 'getTestResults').and.returnValue(Promise.resolve('results'));
    });

    it('starts both benchmarks when starting the test and submits the result tests', async () => {
      spyOn(service, 'submitTest');
      await service.startTest();

      expect(service.benchmarkProcessing).toHaveBeenCalled();
      expect(service.benchmarkConnection).toHaveBeenCalled();
      expect(service.getTestResults).toHaveBeenCalled();
      expect(service.submitTest).toHaveBeenCalledWith('results');
      expect(router.navigate).toHaveBeenCalledWith(['/ict-survey/test-completed']);
    });

    it('sets test_status in localstorage to true if it succeeded', async () => {
      spyOn(service, 'submitTest').and.returnValue(Promise.resolve(true));
      await service.startTest();

      expect(storageService.getItem('test_status')).toBe(true);
    });

    it('sets test_status in localstorage to false if it fails', async () => {
      spyOn(service, 'submitTest').and.returnValue(Promise.reject(true));
      await service.startTest();

      expect(storageService.getItem('test_status')).toBe(false);
    });
  });

  describe('#benchmarkProcessing', () => {
    it('should call this.fibonacci and set processingTime', async () => {
      spyOn(service, 'fibonacci');
      service.fibonacciN = 10;
      service.fibonacciIterations = 2;
      service.processingTime = -1;

      await service.benchmarkProcessing();

      expect(service.fibonacci.calls.allArgs()).toEqual([[10], [10]]);
      expect(service.processingTime).not.toEqual(-1);
    });
  });

  describe('#benchmarkConnection', () => {
    beforeEach(() => {
      jasmine.clock().mockDate(new Date('2018-01-01'));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should get the first file and set connectionSpeed if timeout is > than 8000', async () => {
      service.connectionSpeed = -1;
      spyOn(service, 'requestFile').and.returnValue(Promise.resolve({ fileSize: 128 * 1024, downloadTime: 8001 }));
      spyOn(service, 'getFileUrl').and.callFake((fileSize) => fileSize);

      await service.benchmarkConnection();

      expect(service.getFileUrl).toHaveBeenCalled();
      expect(service.requestFile).toHaveBeenCalled();
      expect(service.connectionSpeed).not.toEqual(-1);
    });

    it('should try to download bigger file when download time is less than 8 seconds', async() => {
      service.connectionSpeed = -1;
      spyOn(service, 'requestFile').and.returnValues(
        Promise.resolve({ fileSize: 128 * 1024, downloadTime: 7001 }),
        Promise.resolve({ fileSize: 256 * 1024, downloadTime: 8001 })
      );
      spyOn(service, 'getFileUrl').and.callFake((fileSize) => fileSize);

      await service.benchmarkConnection();

      expect(service.requestFile.calls.allArgs()).toEqual([['128kb'], ['256kb']]);
      expect(service.requestFile.calls.count()).toEqual(2);
      expect(service.connectionSpeed).not.toEqual(-1);
    });

    it('should retry to download the same file if the size doesnt match', async() => {
      service.connectionSpeed = -1;
      spyOn(service, 'requestFile').and.returnValues(
        Promise.resolve({ fileSize: 124 * 1024, downloadTime: 7001 }),
        Promise.resolve({ fileSize: 128 * 1024, downloadTime: 8001 })
      );
      spyOn(service, 'getFileUrl').and.callFake((fileSize) => fileSize);

      await service.benchmarkConnection();

      expect(service.requestFile.calls.allArgs()).toEqual([['128kb'], ['128kb']]);
      expect(service.requestFile.calls.count()).toEqual(2);
      expect(service.connectionSpeed).not.toEqual(-1);
    });

    it('should limit same file downloads if the size doesnt match', async() => {
      service.connectionSpeed = -1;
      spyOn(service, 'requestFile').and.returnValues(
        Promise.resolve({ fileSize: 124 * 1024, downloadTime: 7001 }),
        Promise.resolve({ fileSize: 124 * 1024, downloadTime: 7001 }),
        Promise.resolve({ fileSize: 124 * 1024, downloadTime: 7001 }),
        Promise.resolve({ fileSize: 124 * 1024, downloadTime: 7001 }),
        Promise.resolve({ fileSize: 256 * 1024, downloadTime: 8001 })
      );
      spyOn(service, 'getFileUrl').and.callFake((fileSize) => fileSize);

      await service.benchmarkConnection();

      expect(service.requestFile.calls.allArgs()).toEqual([['128kb'], ['128kb'], ['128kb'], ['256kb'], ['256kb']]);
      expect(service.requestFile.calls.count()).toEqual(5);
    });
  });
});
