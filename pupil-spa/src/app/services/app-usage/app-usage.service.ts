import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AppUsageService {

  private static appUsageCounter = 0;

  constructor(private storageService: StorageService) {
  }

  store(): void {
    // Store the appUsageCounter in the device data so it is
    // picked up later by storageService.getAllItems()
    const deviceData = this.storageService.getDeviceData() || {};
    deviceData.appUsageCounter = this.getCounterValue();
    this.storageService.setDeviceData(deviceData);
  }

  increment(): void {
    AppUsageService.appUsageCounter += 1;
  }

  getCounterValue(): number {
    return AppUsageService.appUsageCounter;
  }
}
