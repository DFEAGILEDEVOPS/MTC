export class Answer {

  constructor(
    public factor1: number,
    public factor2: number,
    public answer: string,
    public sequenceNumber: number,
    public question: string = `${factor1}x${factor2}`,
    public clientTimestamp: Date = new Date()
  ) { }
}
