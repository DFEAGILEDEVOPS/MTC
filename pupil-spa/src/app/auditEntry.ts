export type AuditEntryType = 'CheckStarted' | 'QuestionRendered' | 'QuestionAnswered' | 'PauseRendered' | 'UserInput';

export class AuditEntry {

  constructor(
    public type: AuditEntryType,
    public clientTimestamp: Date,
    public data?: object) { }
}

export class QuestionRenderedAuditEntry extends AuditEntry {
  constructor(){
    super('QuestionRendered', new Date());
  }
}

export class CheckStartedAuditEntry extends AuditEntry {
  constructor(){
    super('CheckStarted', new Date());
  }
}
