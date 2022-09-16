import { Injectable } from '@angular/core';
import { IStorageService } from '../storage/storage.service';
import { Answer } from './answer.model';
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'

@Injectable()
export class AnswerService {
  constructor(
    private storageService: IStorageService,
    private monotonicTimeService: MonotonicTimeService
  ) { }

  setAnswer(factor1: number, factor2: number, userAnswer: string, sequenceNumber: number): void {
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    const answer = new Answer(factor1, factor2, userAnswer, sequenceNumber, mtime)
    this.storageService.setAnswer(answer)
  }
}
