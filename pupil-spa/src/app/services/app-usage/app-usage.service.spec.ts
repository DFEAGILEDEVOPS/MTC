import { TestBed } from '@angular/core/testing';
import { AppUsageService } from './app-usage.service';
import { StorageService } from '../storage/storage.service';
import { DeviceStorageKey } from '../storage/storageKey';

let appUsageService: AppUsageService;
const mockStorageService = {
  getItem: jasmine.createSpy('getItem'),
  setItem: jasmine.createSpy('setItem')
};

describe('AppUsageService', () => {

  beforeEach(async() => {


    const injector = TestBed.configureTestingModule({
        providers: [
          AppUsageService,
          { provide: StorageService, useValue: mockStorageService },
        ]
      }
    );
    appUsageService = injector.get(AppUsageService);
  });

  it('should be created', () => {
    expect(appUsageService).toBeTruthy();
  });

  it('should fetch the app usage counter value', () => {
    const counter = appUsageService.getCounterValue();
    expect(counter).toBe(0);
  });

  it('should increment the app usage counter by 1', () => {
    appUsageService.increment();
    const counter = appUsageService.getCounterValue();
    expect(counter).toBe(1);
  });

  it('should store the app usage counter', () => {
    const deviceStorageKey = new DeviceStorageKey();
    appUsageService.increment();
    appUsageService.store();
    expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);
    expect(mockStorageService.setItem).toHaveBeenCalledWith(deviceStorageKey, {appUsageCounter: 2});
  });
});
