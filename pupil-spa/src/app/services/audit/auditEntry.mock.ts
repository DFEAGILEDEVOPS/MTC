export class AuditEntryMock {
  constructor(
    public type,
    public clientTimestamp: Date,
    public data?: object) { }
}

export class APICalled extends AuditEntryMock {
  constructor(data?: any) {
    super('APICalled', new Date(), data);
  }
}

export class APICallSucceeded extends AuditEntryMock {
  constructor(data?: any) {
    super('APICallSucceeded', new Date(), data);
  }
}

export class APICallFailed extends AuditEntryMock {
  constructor(data?: any) {
    super('APICallFailed', new Date(), data);
  }
}
