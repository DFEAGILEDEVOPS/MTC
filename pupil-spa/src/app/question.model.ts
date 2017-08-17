export class Question {
  factor1: number;
  factor2: number;
  sequenceNumber: number;
  answer: string;

  constructor(factor1, factor2, sequenceNumber) {
    this.factor1 = factor1;
    this.factor2 = factor2;
    this.sequenceNumber = sequenceNumber;
  }
}
