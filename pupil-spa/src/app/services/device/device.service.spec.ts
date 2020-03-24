import { TestBed } from '@angular/core/testing';
import { StorageService } from '../storage/storage.service';
import { WindowRefService } from '../window-ref/window-ref.service';

import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let service, storageService, windowRefService;

  beforeEach(() => {
    const windowRefServiceMock = {
      nativeWindow: {
        navigator: {
          userAgent: ''
        },
        screen: {
        }
      }
    };
    const injector = TestBed.configureTestingModule({
      providers: [
        DeviceService,
        StorageService,
        { provide: WindowRefService, useValue: windowRefServiceMock }
      ]
    });
    storageService = injector.get(StorageService);
    windowRefService = injector.get(WindowRefService);
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

  describe('isUnsupportedBrowser', () => {
    beforeEach(() => {
      windowRefService.nativeWindow.navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari/537.36';
    })
    it('returns true when browser is IE9/IE10', () => {
      windowRefService.nativeWindow.navigator.userAgent = 'Mozilla/5.0 (compatible MSIE 9.0 Windows NT 6.1 Trident/5.0)';
      const isUnsupportedBrowser = service.isUnsupportedBrowser();
      expect(isUnsupportedBrowser).toBeTruthy();
    });
    it('returns true when browser is IE11', () => {
      windowRefService.nativeWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0 WOW64 Trident/7.0)';
      const isUnsupportedBrowser = service.isUnsupportedBrowser();
      expect(isUnsupportedBrowser).toBeFalsy();
    });
  });
});
