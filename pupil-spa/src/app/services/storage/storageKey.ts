import * as uuid from 'uuid';

export type StorageKeyPrefix = 'answers' | 'inputs' | 'session' |
  'audit' | 'questions' | 'config' | 'pupil' | 'school' | 'access_token' |
  'feedback' | 'checkstate' | 'device' | 'pending_submission' | 'completed_submission' |
  'access_arrangements' | 'tokens' | 'time_out' | 'check_start_time';

export type StorageKeyTypesSingular = SessionStorageKey | QuestionsStorageKey | TokensStorageKey | ConfigStorageKey |
  PupilStorageKey | SchoolStorageKey | FeedbackStorageKey | CheckStateStorageKey |
  DeviceStorageKey | PendingSubmissionStorageKey | CompletedSubmissionStorageKey | AccessArrangementsStorageKey |
  TimeoutStorageKey | CheckStartTimeStorageKey;

export type StorageKeyTypesMulti = AnswersStorageKey | InputsStorageKey | AuditStorageKey;

export type StorageKeyTypesAll = StorageKeyTypesMulti | StorageKeyTypesSingular;

abstract class StorageKey {
  protected prefix: StorageKeyPrefix;
  protected suffix?: string;

  public toString (): string {
    return this.suffix ? `${this.prefix}-${this.suffix}` : this.prefix;
  }
}

export class AnswersStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'answers';
    this.suffix = uuid.v4();
  }
}

export class InputsStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'inputs';
    this.suffix = uuid.v4();
  }
}

export class SessionStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'session';
  }
}

export class AuditStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'audit';
    this.suffix = uuid.v4();
  }
}

export class QuestionsStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'questions';
  }
}

export class ConfigStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'config';
  }
}

export class PupilStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'pupil';
  }
}

export class SchoolStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'school';
  }
}

export class FeedbackStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'feedback';
  }
}

export class CheckStateStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'checkstate';
  }
}

export class DeviceStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'device';
  }
}

export class PendingSubmissionStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'pending_submission';
  }
}

export class CompletedSubmissionStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'completed_submission';
  }
}

export class AccessArrangementsStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'access_arrangements';
  }
}

export class TokensStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'tokens';
  }
}

export class TimeoutStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'time_out';
  }
}

export class CheckStartTimeStorageKey extends StorageKey {
  constructor() {
    super();
    this.prefix = 'check_start_time';
  }
}
