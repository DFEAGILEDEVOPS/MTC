import { Injectable } from '@angular/core'
import { StorageService } from '../storage/storage.service'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { MonotonicTime } from '../../monotonic-time'

export interface IQrCodeUsageService {
  initialiseFromLocalStorage(): void
  storeToLocalStorage(): void
  qrCodeArrival(): void
  qrCodeSubsequentAppUsage(): void
}

@Injectable({
  providedIn: 'root'
})
export class QrCodeUsageService implements IQrCodeUsageService {
  private qrCodeArrivalTimestamps: MonotonicTime[] = []
  private qrCodeSubsequentAppUses: MonotonicTime[] = []

  constructor(
    private storageService: StorageService,
    private monotonicTimeService: MonotonicTimeService) {
    this.initialiseFromLocalStorage()
  }

  initialiseFromLocalStorage () {
    console.log('ToDo: actually re-initialise from local storage on refresh')
    this.storageService.getAllItems() // fixme
  }

  storeToLocalStorage () {
    console.log('ToDo: actually store the monotonic time as EVENTS')
    console.debug('qrCodeArrivalTimes: ', this.qrCodeArrivalTimestamps)
    console.debug('qrCodeSubsequentAppUses: ', this.qrCodeSubsequentAppUses)
  }

  qrCodeArrival () {
    this.qrCodeArrivalTimestamps.push(this.monotonicTimeService.getMonotonicDateTime())
  }

  qrCodeSubsequentAppUsage () {
    this.qrCodeSubsequentAppUses.push(this.monotonicTimeService.getMonotonicDateTime())
  }
}
