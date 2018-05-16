import { Injectable } from '@angular/core';

@Injectable()
export class AppUsageService {

  private appUsageCounter;

  constructor() {
    this.appUsageCounter = 0;
  }

  increment(): void {
    this.appUsageCounter += 1;
  }

  getCounterValue(): number {
    return this.appUsageCounter;
  }
}
