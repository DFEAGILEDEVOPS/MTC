import { Injectable } from '@angular/core'
import { StorageService } from '../storage/storage.service'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { MonotonicTime } from '../../monotonic-time'
import { AuditEntryFactory } from '../audit/auditEntry'
import { AuditService } from '../audit/audit.service'

export interface IQrCodeUsageService {
  initialiseFromLocalStorage(): void
  storeToLocalStorage(): void
  qrCodeArrival(): void
  qrCodeSubsequentAppUsage(): void
  closeQrCodeArrivalSession(): void
  getQrCodeArrivalSession(): boolean
}

@Injectable({
  providedIn: 'root'
})
export class QrCodeUsageService implements IQrCodeUsageService {
  private qrCodeArrivalTimestamps: MonotonicTime[] = []
  private qrCodeSubsequentAppUses: MonotonicTime[] = []
  private isQrCodeArrivalSession: boolean = false

  constructor(
    private storageService: StorageService,
    private monotonicTimeService: MonotonicTimeService,
    private auditEntryFactory:AuditEntryFactory,
    private auditService: AuditService) {
    this.initialiseFromLocalStorage()
  }

  initialiseFromLocalStorage () {
    console.log('ToDo: actually re-initialise from local storage on refresh')
    this.storageService.getAllItems() // fixme
  }

  storeToLocalStorage () {
    this.qrCodeArrivalTimestamps.forEach(ts => {
      const auditEntry = this.auditEntryFactory.createQrCodeArrivalAuditEntryClass(ts)
      this.auditService.addEntry(auditEntry)
    })
    this.qrCodeSubsequentAppUses.forEach(ts => {
      const auditEntry = this.auditEntryFactory.createQrCodeSubsequentUsageAuditEntryClass(ts)
      this.auditService.addEntry(auditEntry)
    })
  }

  qrCodeArrival () {
    this.qrCodeArrivalTimestamps.push(this.monotonicTimeService.getMonotonicDateTime())
    this.isQrCodeArrivalSession = true
  }

  qrCodeSubsequentAppUsage () {
    this.qrCodeSubsequentAppUses.push(this.monotonicTimeService.getMonotonicDateTime())
  }

  closeQrCodeArrivalSession () {
    this.isQrCodeArrivalSession = false
  }

  getQrCodeArrivalSession () {
    return this.isQrCodeArrivalSession
  }
}
