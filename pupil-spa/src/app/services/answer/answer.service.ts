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
    const previousAnswers = this.getPreviousAnswers(answer, answers);

    if (previousAnswers.length > 0) {
      // Log this error
      this.auditService.addEntry(new DuplicateAnswerError(answer));
      return;
    }
    answers.push(answer);
    this.storageService.setItem('answers', answers);
  }

  /**
   * Find a previous answer in the answers array
   * @param {Answer} answer - the current answer to be stored
   * @param [Answer] answers - the list of previously stored answers
   * @return [Answer?] - empty array or array of answers
   */
  private getPreviousAnswers(answer: Answer, answers) {
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
