import { Injectable } from '@angular/core';

@Injectable()
export class AppCountService {

  private appUsageCounter;

  constructor() {
    this.appUsageCounter = 0;
  }

  increment(): void {
    this.appUsageCounter += 1;
  }

  reset(): void {
    this.appUsageCounter = 0;
  }

  getCounterValue(): number {
    return this.appUsageCounter;
  }
}
