export type AuditEntryType = 'WarmupIntroRendered' | 'WarmupCompleteRendered' | 'CheckComplete' |
'CheckStarted' | 'QuestionRendered' | 'QuestionAnswered' | 'PauseRendered';

export abstract class AuditEntry {

  constructor(
    public type: AuditEntryType,
    public clientTimestamp: Date,
    public data?: object) { }
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

export class CheckComplete extends AuditEntry {
  constructor(data?: any) {
    super('CheckComplete', new Date(), data);
  }
}
