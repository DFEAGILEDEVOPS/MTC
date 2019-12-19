import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { DeviceStorageKey } from '../storage/storageKey';


@Injectable()
export class AppUsageService {

  private static appUsageCounter = 0;

  constructor(private storageService: StorageService) {
  }

  store(): void {
    // Store the appUsageCounter in the device data so it is
    // picked up later by storageService.getAllItems()
    const deviceData = this.storageService.getItem(new DeviceStorageKey()) || {};
    deviceData.appUsageCounter = this.getCounterValue();
    this.storageService.setItem(new DeviceStorageKey(), deviceData);
  }

  increment(): void {
    AppUsageService.appUsageCounter += 1;
  }

  getCounterValue(): number {
    return AppUsageService.appUsageCounter;
  }
}
