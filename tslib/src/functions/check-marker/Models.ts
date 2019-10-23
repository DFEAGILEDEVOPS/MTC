export interface ICheckMarkerFunctionBindings {
  receivedCheckTable: Array<any>;
  checkNotificationQueue: Array<any>;
}
export interface Answer {
  factor1: number;
  factor2: number;
  answer: string;
  sequenceNumber: number;
  question: string;
  clientTimestamp: string;
}
export interface CheckFormQuestion {
  f1: number;
  f2: number;
}
export interface MarkingData {
  answers: Array<Answer>;
  formQuestions: Array<CheckFormQuestion>;
  results: any;
}
export interface Mark {
  mark: number;
  maxMarks: number;
  processedAt: Date;
}
