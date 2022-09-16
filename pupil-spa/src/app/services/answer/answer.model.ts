import { MonotonicTime } from '../../monotonic-time'

export class Answer {

  constructor(
    public factor1: number,
    public factor2: number,
    public answer: string,
    public sequenceNumber: number,
    public clientTimestamp: MonotonicTime,
    public question: string = `${factor1}x${factor2}`,
  ) { }
}
