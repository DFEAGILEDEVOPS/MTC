import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { DeviceService } from '../device/device.service';


@Injectable()
export class AppUsageService {

  private appUsageCounter: number;

  constructor(private storageService: StorageService) {
    const deviceData = storageService.getItem(DeviceService.storageKey);
    this.appUsageCounter = deviceData && deviceData.appUsageCounter || 0;
  }

  store(): void {
    const deviceData = this.storageService.getItem(DeviceService.storageKey) || {};
    deviceData.appUsageCounter = this.appUsageCounter;
    this.storageService.setItem(DeviceService.storageKey, deviceData);
  }

  increment(): void {
    this.appUsageCounter += 1;
  }

  getCounterValue(): number {
    return this.appUsageCounter;
  }
}
