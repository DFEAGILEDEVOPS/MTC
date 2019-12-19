import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Answer } from './answer.model';
import { AuditService } from '../audit/audit.service';
import { DuplicateAnswerError } from '../audit/auditEntry';
import { AnswersStorageKey } from '../storage/storageKey';

@Injectable()
export class AnswerService {

  constructor(private storageService: StorageService,
              private auditService: AuditService) { }

  setAnswer(answer: Answer): void {

    // Check for duplicates - we can only store one answer for each question
    const previousAnswers = this.getPreviousAnswers(answer);
    if (previousAnswers.length > 0) {
      // Log this error
      this.auditService.addEntry(new DuplicateAnswerError(answer));
      return;
    }
    this.storageService.setItem(new AnswersStorageKey(), answer);
  }

  /**
   * Find a previous answer in the answers array
   * @param {Answer} answer - the current answer to be stored
   * @return [Answer?] - empty array or array of answers
   */
  private getPreviousAnswers(answer: Answer) {
    const answers = this.storageService.fetchAllEntriesByKey('answers');
    return answers.filter(
      x => {
        if (x.sequenceNumber === answer.sequenceNumber
          && x.factor1 === answer.factor1
          && x.factor2 === answer.factor2) {
          return true;
        }
        return false;
      });
  }
}
