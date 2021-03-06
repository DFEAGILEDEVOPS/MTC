export type AuditEntryType = 'PupilPrefsAPICalled' | 'PupilPrefsAPICallSucceeded' | 'PupilPrefsAPICallFailed' |
  'WarmupStarted' | 'WarmupIntroRendered' | 'WarmupCompleteRendered'  | 'QuestionIntroRendered'|
  'CheckStartedApiCalled' | 'CheckStartedAPICallSucceeded' | 'CheckStartedAPICallFailed' |
  'CheckSubmissionPending' | 'CheckSubmissionApiCalled' | 'CheckSubmissionAPICallSucceeded' |
  'CheckSubmissionAPIFailed' | 'CheckSubmissionFailed' | 'SessionExpired' | 'CheckStarted' | 'QuestionRendered' | 'QuestionAnswered' |
  'PauseRendered' | 'RefreshDetected' |'UtteranceStarted' | 'UtteranceEnded' | 'QuestionReadingStarted' | 'QuestionReadingEnded' |
  'QuestionTimerStarted' | 'QuestionTimerEnded' | 'QuestionTimerCancelled' | 'AppError' |
  'AppVisible' | 'AppHidden' | 'RefreshOrTabCloseDetected';

export abstract class AuditEntry {

  constructor(
    public type: AuditEntryType,
    public clientTimestamp: Date,
    public data?: object) { }
}

export class PupilPrefsAPICalled extends AuditEntry {
  constructor(data?: any) {
    super('PupilPrefsAPICalled', new Date(), data);
  }
}

export class PupilPrefsAPICallSucceeded extends AuditEntry {
  constructor(data?: any) {
    super('PupilPrefsAPICallSucceeded', new Date(), data);
  }
}

export class PupilPrefsAPICallFailed extends AuditEntry {
  constructor(data?: any) {
    super('PupilPrefsAPICallFailed', new Date(), data);
  }
}

export class WarmupStarted extends AuditEntry {
  constructor(data?: any) {
    super('WarmupStarted', new Date(), data);
  }
}

export class WarmupIntroRendered extends AuditEntry {
  constructor(data?: any) {
    super('WarmupIntroRendered', new Date(), data);
  }
}

export class QuestionIntroRendered extends AuditEntry {
  constructor(data?: any) {
    super('QuestionIntroRendered', new Date(), data);
  }
}

export class WarmupCompleteRendered extends AuditEntry {
  constructor(data?: any) {
    super('WarmupCompleteRendered', new Date(), data);
  }
}

export class CheckStartedApiCalled extends AuditEntry {
  constructor(data?: any) {
    super('CheckStartedApiCalled', new Date(), data);
  }
}

export class CheckStartedAPICallSucceeded extends AuditEntry {
  constructor(data?: any) {
    super('CheckStartedAPICallSucceeded', new Date(), data);
  }
}

export class CheckStartedAPICallFailed extends AuditEntry {
  constructor(data?: any) {
    super('CheckStartedAPICallFailed', new Date(), data);
  }
}

export class QuestionRendered extends AuditEntry {
  constructor(data?: any) {
    super('QuestionRendered', new Date(), data);
  }
}

export class CheckStarted extends AuditEntry {
  constructor(data?: any) {
    super('CheckStarted', new Date(), data);
  }
}

export class QuestionAnswered extends AuditEntry {
  constructor(data?: any) {
    super('QuestionAnswered', new Date(), data);
  }
}

export class PauseRendered extends AuditEntry {
  constructor(data?: any) {
    super('PauseRendered', new Date(), data);
  }
}

export class CheckSubmissionPending extends AuditEntry {
  constructor(data?: any) {
    super('CheckSubmissionPending', new Date(), data);
  }
}

export class CheckSubmissionApiCalled extends AuditEntry {
  constructor(data?: any) {
    super('CheckSubmissionApiCalled', new Date(), data);
  }
}

export class CheckSubmissionAPICallSucceeded extends AuditEntry {
  constructor(data?: any) {
    super('CheckSubmissionAPICallSucceeded', new Date(), data);
  }
}

export class CheckSubmissionAPIFailed extends AuditEntry {
  constructor(data?: any) {
    super('CheckSubmissionAPIFailed', new Date(), data);
  }
}

export class CheckSubmissionFailed extends AuditEntry {
  constructor(data?: any) {
    super('CheckSubmissionFailed', new Date(), data);
  }
}

export class SessionExpired extends AuditEntry {
  constructor(data?: any) {
    super('SessionExpired', new Date(), data);
  }
}

export class RefreshDetected extends AuditEntry {
  constructor(data?: any) {
    super('RefreshDetected', new Date(), data);
  }
}

export class UtteranceStarted extends AuditEntry {
  constructor(data?: any) {
    super('UtteranceStarted', new Date(), data);
  }
}

export class UtteranceEnded extends AuditEntry {
  constructor(data?: any) {
    super('UtteranceEnded', new Date(), data);
  }
}

export class QuestionReadingStarted extends AuditEntry {
  constructor(data?: any) {
    super('QuestionReadingStarted', new Date(), data);
  }
}

export class QuestionReadingEnded extends AuditEntry {
  constructor(data?: any) {
    super('QuestionReadingEnded', new Date(), data);
  }
}

export class QuestionTimerStarted extends AuditEntry {
  constructor(data?: any) {
    super('QuestionTimerStarted', new Date(), data);
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
