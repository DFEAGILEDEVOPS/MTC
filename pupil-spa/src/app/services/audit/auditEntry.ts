export type AuditEntryType = 'WarmupStarted' | 'WarmupIntroRendered' | 'WarmupCompleteRendered'  | 'CheckStartedApiCalled' |
  'CheckStartedAPICallSucceeded' | 'CheckStartedAPICallFailed' | 'CheckSubmissionPending' | 'CheckSubmissionApiCalled' |
  'CheckSubmissionAPICallSucceeded' | 'CheckSubmissionAPIFailed' | 'CheckComplete' | 'CheckSubmissionFailed' | 'CheckStarted' |
  'QuestionRendered' | 'QuestionAnswered' | 'PauseRendered' | 'RefreshDetected' |'UtteranceStarted' | 'UtteranceEnded';

export abstract class AuditEntry {

  constructor(
    public type: AuditEntryType,
    public clientTimestamp: Date,
    public data?: object) { }
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

export class CheckComplete extends AuditEntry {
  constructor(data?: any) {
    super('CheckComplete', new Date(), data);
  }
}

export class CheckSubmissionFailed extends AuditEntry {
  constructor(data?: any) {
    super('CheckSubmissionFailed', new Date(), data);
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
