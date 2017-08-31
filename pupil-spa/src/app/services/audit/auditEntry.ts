export type AuditEntryType = 'WarmupIntroRendered' | 'WarmupPauseRendered' | 'WarmupQuestionRendered' | 'WarmupCompleteRendered' |
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

export class WarmupPauseRendered extends AuditEntry {
  constructor(data?: any) {
    super('WarmupPauseRendered', new Date(), data);
  }
}

export class WarmupQuestionRendered extends AuditEntry {
  constructor(data?: any) {
    super('WarmupQuestionRendered', new Date(), data);
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
