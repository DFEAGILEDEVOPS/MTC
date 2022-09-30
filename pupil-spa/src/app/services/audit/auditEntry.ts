import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { MonotonicTime } from '../../monotonic-time'
import { Injectable } from '@angular/core'

export type AuditEntryType = 'PupilPrefsAPICalled' | 'PupilPrefsAPICallSucceeded' | 'PupilPrefsAPICallFailed' |
  'WarmupStarted' | 'WarmupIntroRendered' | 'WarmupCompleteRendered'  | 'QuestionIntroRendered'|
  'CheckStartedApiCalled' | 'CheckStartedAPICallSucceeded' | 'CheckStartedAPICallFailed' |
  'CheckSubmissionPending' | 'CheckSubmissionApiCalled' | 'CheckSubmissionAPICallSucceeded' |
  'CheckSubmissionAPIFailed' | 'CheckSubmissionFailed' | 'SessionExpired' | 'CheckStarted' | 'QuestionRendered' | 'QuestionAnswered' |
  'PauseRendered' | 'RefreshDetected' |'UtteranceStarted' | 'UtteranceEnded' | 'QuestionReadingStarted' | 'QuestionReadingEnded' |
  'QuestionTimerStarted' | 'QuestionTimerEnded' | 'QuestionTimerCancelled' | 'AppError' |
  'AppVisible' | 'AppHidden' | 'RefreshOrTabCloseDetected';

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
    super('PupilPrefsAPICalled', mtime.formatAsDate(), data);
  }
}

export class PupilPrefsAPICallSucceeded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('PupilPrefsAPICallSucceeded', mtime.formatAsDate(), data);
  }
}

export class PupilPrefsAPICallFailed extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('PupilPrefsAPICallFailed', mtime.formatAsDate(), data);
  }
}

export class WarmupStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('WarmupStarted', mtime.formatAsDate(), data);
  }
}

export class WarmupIntroRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('WarmupIntroRendered', mtime.formatAsDate(), data);
  }
}

export class QuestionIntroRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionIntroRendered', mtime.formatAsDate(), data);
  }
}

export class WarmupCompleteRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('WarmupCompleteRendered', mtime.formatAsDate(), data);
  }
}

export class CheckStartedApiCalled extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckStartedApiCalled', mtime.formatAsDate(), data);
  }
}

export class CheckStartedAPICallSucceeded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckStartedAPICallSucceeded', mtime.formatAsDate(), data);
  }
}

export class CheckStartedAPICallFailed extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckStartedAPICallFailed', mtime.formatAsDate(), data);
  }
}

export class QuestionRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionRendered', mtime.formatAsDate(), data);
  }
}

export class CheckStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckStarted', mtime.formatAsDate(), data);
  }
}

export class QuestionAnswered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionAnswered', mtime.formatAsDate(), data);
  }
}

export class PauseRendered extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('PauseRendered', mtime.formatAsDate(), data);
  }
}

export class CheckSubmissionPending extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionPending', mtime.formatAsDate(), data);
  }
}

export class CheckSubmissionApiCalled extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionApiCalled', mtime.formatAsDate(), data);
  }
}

export class CheckSubmissionAPICallSucceeded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionAPICallSucceeded', mtime.formatAsDate(), data);
  }
}

export class CheckSubmissionAPIFailed extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionAPIFailed', mtime.formatAsDate(), data);
  }
}

export class CheckSubmissionFailed extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionFailed', mtime.formatAsDate(), data);
  }
}

export class SessionExpired extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionFailed', mtime.formatAsDate(), data);
  }
}

export class RefreshDetected extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('CheckSubmissionFailed', mtime.formatAsDate(), data);
  }
}

export class UtteranceStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('UtteranceStarted', mtime.formatAsDate(), data);
  }
}

export class UtteranceEnded extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('UtteranceEnded', mtime.formatAsDate(), data);
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
    super('QuestionReadingEnded', mtime.formatAsDate(), data);
  }
}

export class QuestionTimerStarted extends AuditEntry {
  constructor(mtime: MonotonicTime, data: any = {}) {
    data.monotonicTime = mtime.getDto()
    super('QuestionTimerStarted', mtime.formatAsDate(), data);
  }
}

export class QuestionTimerEnded extends AuditEntry {
  constructor(data?: any) {
    super('QuestionTimerEnded', new Date(), data);
  }
}

export class QuestionTimerCancelled extends AuditEntry {
  constructor(data?: any) {
    super('QuestionTimerCancelled', new Date(), data);
  }
}

export class AppError extends AuditEntry {
  constructor(data?: any) {
    super('AppError', new Date(), data);
  }
}

export class AppVisible extends AuditEntry {
  constructor(data?: any) {
    super('AppVisible', new Date(), data);
  }
}

export class AppHidden extends AuditEntry {
  constructor(data?: any) {
    super('AppHidden', new Date(), data);
  }
}

export class RefreshOrTabCloseDetected extends AuditEntry {
  constructor(data?: any) {
    super('RefreshOrTabCloseDetected', new Date(), data);
  }
}
