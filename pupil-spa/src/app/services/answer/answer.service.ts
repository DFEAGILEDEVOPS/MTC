import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Answer } from './answer.model';
import { AuditService } from '../audit/audit.service';
import { DuplicateAnswerError } from '../audit/auditEntry';

@Injectable()
export class AnswerService {

  constructor(private storageService: StorageService,
              private auditService: AuditService) { }

  setAnswer(answer: Answer): void {

    let answers = this.storageService.getItem('answers');

    if (!answers) {
      answers = [];
    }

    // Check for duplicates - we can only store one answer for each question
    const isAlreadyAnswered = answers.filter(
      x => {
        if (x.sequenceNumber === answer.sequenceNumber
        && x.factor1 === answer.factor1
        && x.factor2 === answer.factor2) {
          return true;
        }
        return false;
      });

    if (isAlreadyAnswered.length) {
      // Log this error
      this.auditService.addEntry(new DuplicateAnswerError(answer));
      return;
    }

    answers.push(answer);
    this.storageService.setItem('answers', answers);
  }
}
