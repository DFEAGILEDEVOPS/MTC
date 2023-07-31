import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { MonotonicTime } from '../../monotonic-time'
import { Injectable } from '@angular/core'

export type AuditEntryType =
  'AppError' |
  'AppHidden' |
  'AppVisible' |
  'CheckStarted' |
  'CheckStartedApiCalled' |
  'CheckStartedAPICallFailed' |
  'CheckStartedAPICallSucceeded' |
  'CheckSubmissionApiCalled' |
  'CheckSubmissionAPICallSucceeded' |
  'CheckSubmissionAPIFailed' |
  'CheckSubmissionFailed' |
  'CheckSubmissionPending' |
  'LoginSuccess' |
  'PauseRendered' |
  'PupilPrefsAPICalled' |
  'PupilPrefsAPICallFailed' |
  'PupilPrefsAPICallSucceeded' |
  'QrCodeArrival' |
  'QrCodeSubsequentUsage' |
  'QuestionAnswered' |
  'QuestionIntroRendered'|
  'QuestionReadingEnded' |
  'QuestionReadingStarted' |
  'QuestionRendered' |
  'QuestionTimerCancelled' |
  'QuestionTimerEnded' |
  'QuestionTimerStarted' |
  'RefreshDetected' |
  'RefreshOrTabCloseDetected' |
  'SessionExpired' |
  'UtteranceEnded' |
  'UtteranceStarted' |
  'WarmupCompleteRendered'  |
  'WarmupIntroRendered' |
  'WarmupStarted'
  ;

@Injectable({
  providedIn: 'root'
})
export class AuditEntryFactory {
  constructor (private monotonicTimeService: MonotonicTimeService) {
  }

  createPupilPrefsAPICalled (data?: any) {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new PupilPrefsAPICalled(mtime, data)
  }

  createPupilPrefsAPICallSucceeded(data?: any) {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new PupilPrefsAPICallSucceeded(mtime, data)
  }

  createPupilPrefsAPICallFailed(data?: any): PupilPrefsAPICallFailed {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new PupilPrefsAPICallFailed(mtime, data)
  }

  createWarmupStarted(data?: any): WarmupStarted {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new WarmupStarted(mtime, data)
  }

  createWarmupIntroRendered(data?: any): WarmupIntroRendered {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new WarmupIntroRendered(mtime, data)
  }

  createQuestionIntroRendered(data?: any): QuestionIntroRendered {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new QuestionIntroRendered(mtime, data)
  }

  createWarmupCompleteRendered(data?: any): WarmupCompleteRendered {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new WarmupCompleteRendered(mtime, data)
  }

  createCheckStartedApiCalled(data?: any): CheckStartedApiCalled {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new CheckStartedApiCalled(mtime, data)
  }

  createCheckStartedAPICallSucceeded(data?: any): CheckStartedAPICallSucceeded {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new CheckStartedAPICallSucceeded(mtime, data)
  }

  createCheckStartedAPICallFailed(data?: any): CheckStartedAPICallFailed {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new CheckStartedAPICallFailed(mtime, data)
  }

  createQuestionRendered(data?: any): QuestionRendered {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new QuestionRendered(mtime, data)
  }

  createCheckStarted(mtime?: MonotonicTime, data?: any): CheckStarted {
    if (mtime === undefined) {
      mtime = this.monotonicTimeService.getMonotonicDateTime()
    }
    return new CheckStarted(mtime, data)
  }

  createQuestionAnswered(data?: any): QuestionAnswered {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new QuestionAnswered(mtime, data)
  }

  createPauseRendered(data?: any): PauseRendered {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new PauseRendered(mtime, data)
  }

  createCheckSubmissionPending(data?: any): CheckSubmissionPending {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new CheckSubmissionPending(mtime, data)
  }

  createCheckSubmissionApiCalled(data?: any): CheckSubmissionApiCalled {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new CheckSubmissionApiCalled(mtime, data)
  }

  createCheckSubmissionAPICallSucceeded(data?: any): CheckSubmissionAPICallSucceeded {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new CheckSubmissionAPICallSucceeded(mtime, data)
  }

  createCheckSubmissionAPIFailed(data?: any): CheckSubmissionAPIFailed {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new CheckSubmissionAPIFailed(mtime, data)
  }

  createCheckSubmissionFailed(data?: any): CheckSubmissionFailed {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new CheckSubmissionFailed(mtime, data)
  }

  createSessionExpired(data?: any): SessionExpired {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new SessionExpired(mtime, data)
  }

  createRefreshDetected(data?: any): RefreshDetected {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new RefreshDetected(mtime, data)
  }

  createUtteranceStarted(data?: any): UtteranceStarted {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new UtteranceStarted(mtime, data)
  }

  createUtteranceEnded(data?: any): UtteranceEnded {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new UtteranceEnded(mtime, data)
  }

  createQuestionReadingStarted(data?: any): QuestionReadingStarted {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new QuestionReadingStarted(mtime, data)
  }

  createQuestionReadingEnded(data?: any): QuestionReadingEnded {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new QuestionReadingEnded(mtime, data)
  }

  createQuestionTimerStarted(data?: any): QuestionTimerStarted {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new QuestionTimerStarted(mtime, data)
  }

  createQuestionTimerEnded(data?: any): QuestionTimerEnded {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new QuestionTimerEnded(mtime, data)
  }

  createQuestionTimerCancelled(data?: any): QuestionTimerCancelled {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new QuestionTimerCancelled(mtime, data)
  }

  createAppError(data?: any): AppError {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new AppError(mtime, data)
  }

  createAppVisible(data?: any): AppVisible {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new AppVisible(mtime, data)
  }

  createAppHidden(data?: any): AppHidden {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new AppHidden(mtime, data)
  }

  createRefreshOrTabCloseDetected(data?: any): RefreshOrTabCloseDetected {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    return new RefreshOrTabCloseDetected(mtime, data)
  }

  createQrCodeArrivalAuditEntryClass(mtime?: MonotonicTime, data?: any): QrCodeArrivalAuditEntryClass {
    if (mtime === undefined) {
      mtime = this.monotonicTimeService.getMonotonicDateTime()
    }
    return new QrCodeArrivalAuditEntryClass(mtime, data)
  }

  createQrCodeSubsequentUsageAuditEntryClass(mtime?: MonotonicTime, data?: any): QrCodeArrivalAuditEntryClass {
    if (mtime === undefined) {
      mtime = this.monotonicTimeService.getMonotonicDateTime()
    }
    return new QrCodeSubsequentUsageAuditEntryClass(mtime, data)
  }

  createLoginSuccessAuditEntryClass(mtime?: MonotonicTime, data?: any): QrCodeArrivalAuditEntryClass {
    if (mtime === undefined) {
      mtime = this.monotonicTimeService.getMonotonicDateTime()
    }
    return new LoginSuccessAuditEntryClass(mtime, data)
  }
}


export abstract class AuditEntry {

  constructor(
    public type: AuditEntryType,
    public clientTimestamp: Date,
    public data?: object) { }
}

export class PupilPrefsAPICalled extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('PupilPrefsAPICalled', mtime.getLegacyDate(), data);
  }
}

export class PupilPrefsAPICallSucceeded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('PupilPrefsAPICallSucceeded', mtime.getLegacyDate(), data);
  }
}

export class PupilPrefsAPICallFailed extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('PupilPrefsAPICallFailed', mtime.getLegacyDate(), data);
  }
}

export class WarmupStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('WarmupStarted', mtime.getLegacyDate(), data);
  }
}

export class WarmupIntroRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('WarmupIntroRendered', mtime.getLegacyDate(), data);
  }
}

export class QuestionIntroRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionIntroRendered', mtime.getLegacyDate(), data);
  }
}

export class WarmupCompleteRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('WarmupCompleteRendered', mtime.getLegacyDate(), data);
  }
}

export class CheckStartedApiCalled extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckStartedApiCalled', mtime.getLegacyDate(), data);
  }
}

export class CheckStartedAPICallSucceeded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckStartedAPICallSucceeded', mtime.getLegacyDate(), data);
  }
}

export class CheckStartedAPICallFailed extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckStartedAPICallFailed', mtime.getLegacyDate(), data);
  }
}

export class QuestionRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionRendered', mtime.getLegacyDate(), data);
  }
}

export class CheckStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckStarted', mtime.getLegacyDate(), data);
  }
}

export class QuestionAnswered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionAnswered', mtime.getLegacyDate(), data);
  }
}

export class PauseRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('PauseRendered', mtime.getLegacyDate(), data);
  }
}

export class CheckSubmissionPending extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionPending', mtime.getLegacyDate(), data);
  }
}

export class CheckSubmissionApiCalled extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionApiCalled', mtime.getLegacyDate(), data);
  }
}

export class CheckSubmissionAPICallSucceeded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionAPICallSucceeded', mtime.getLegacyDate(), data);
  }
}

export class CheckSubmissionAPIFailed extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionAPIFailed', mtime.getLegacyDate(), data);
  }
}

export class CheckSubmissionFailed extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionFailed', mtime.getLegacyDate(), data);
  }
}

export class SessionExpired extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('SessionExpired', mtime.getLegacyDate(), data);
  }
}

export class RefreshDetected extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('RefreshDetected', mtime.getLegacyDate(), data);
  }
}

export class UtteranceStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('UtteranceStarted', mtime.getLegacyDate(), data);
  }
}

export class UtteranceEnded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('UtteranceEnded', mtime.getLegacyDate(), data);
  }
}

export class QuestionReadingStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionReadingStarted', mtime.formatAsDate(), data);
  }
}

export class QuestionReadingEnded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionReadingEnded', mtime.getLegacyDate(), data);
  }
}

export class QuestionTimerStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionTimerStarted', mtime.getLegacyDate(), data);
  }
}

export class QuestionTimerEnded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionTimerEnded', mtime.getLegacyDate(), data);
  }
}

export class QuestionTimerCancelled extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionTimerCancelled', mtime.getLegacyDate(), data);
  }
}

export class AppError extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('AppError', mtime.getLegacyDate(), data);
  }
}

export class AppVisible extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('AppVisible', mtime.getLegacyDate(), data);
  }
}

export class AppHidden extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('AppHidden', mtime.getLegacyDate(), data);
  }
}

export class RefreshOrTabCloseDetected extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('RefreshOrTabCloseDetected', mtime.getLegacyDate(), data);
  }
}

export class QrCodeArrivalAuditEntryClass extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QrCodeArrival', mtime.getLegacyDate(), data);
  }
}

export class QrCodeSubsequentUsageAuditEntryClass extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QrCodeSubsequentUsage', mtime.getLegacyDate(), data);
  }
}

export class LoginSuccessAuditEntryClass extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('LoginSuccess', mtime.getLegacyDate(), data);
  }
}
