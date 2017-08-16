export type AuditEntryType = 'CheckStarted' | 'QuestionRendered' | 'QuestionAnswered' | 'PauseRendered' | 'UserInput';

export class AuditEntry {

  constructor(
    public type: AuditEntryType,
    public clientTimestamp: Date,
    public data?: object) { }
}
