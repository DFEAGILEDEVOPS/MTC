import { Injectable } from '@angular/core'
import { StorageService } from '../storage/storage.service'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { MonotonicTime } from '../../monotonic-time'
import { AuditEntryFactory } from '../audit/auditEntry'
import { AuditService } from '../audit/audit.service'

export interface IQrCodeUsageService {
  /**
   * The QR code system is a memory based system, but also written to local storage in the event system.
   */
  initialiseFromLocalStorage(): void // FIXME: actually implement this.

  /**
   * Write the QR code memory-based data to the event log payload for the current check.
   */
  storeToLocalStorage(): void

  /**
   * Store in memory that the QR code was just used.
   */
  qrCodeArrival(): void

  /**
   * Store in memory that a login just took place on an app that was originally opened using the QR code.
   */
  qrCodeSubsequentAppUsageIfNeeded(): void

  /**
   * Change the state of the QR code usage service so that subsequent users get QrCodeSubsequentUsage entries and not QrCodeArrival.
   */
  closeQrCodeArrivalSession(): void

  /**
   * Returns true if the app was opened using the QR code by the original user.
   */
  appWasOpenedUsingQrCode(): boolean

  /**
   * Returns true if the current logged in user was the one who used the QR code.
   */
  didThisLoginSessionUsetheQrCode(): boolean
}

@Injectable({
  providedIn: 'root'
})
export class QrCodeUsageService implements IQrCodeUsageService {
  private qrCodeArrivalTimestamps: MonotonicTime[] = []
  private qrCodeSubsequentAppUses: MonotonicTime[] = []

  /**
   * isQrCodeArrivalSession: a boolean flag to determine whether the
   */
  private isQrCodeArrivalSession: boolean = false

  /**
   * Store that the app was opened using the QR code.  Once set to true this is permanent for the lifetime of the app.
   */
  private _appWasOpenedUsingQrCode = false

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
    this._appWasOpenedUsingQrCode = true
  }

  closeQrCodeArrivalSession () {
    this.isQrCodeArrivalSession = false
  }

  qrCodeSubsequentAppUsageIfNeeded () {
    if (!this.isQrCodeArrivalSession) {
      this.qrCodeSubsequentAppUses.push(this.monotonicTimeService.getMonotonicDateTime())
    }
  }

  appWasOpenedUsingQrCode () {
    return this._appWasOpenedUsingQrCode
  }

  didThisLoginSessionUsetheQrCode () {
    return this.isQrCodeArrivalSession
  }

  postLoginHook() {
    // The sequencing is important here.
    this.qrCodeSubsequentAppUsageIfNeeded()
    this.closeQrCodeArrivalSession() // This must be after qrCodeSubsequentAppUsageIfNeeded() and not before
    this.storeToLocalStorage()
  }
}
