import { Injectable } from '@angular/core';
import { StorageService } from './storage.service'

export class Answer {

  constructor(
    public factor1: number,
    public factor2: number,
    public answer: number)
  { }
}

@Injectable()
export class AnswerService {

  constructor(private storageService: StorageService) { }

  setAnswer(answer: Answer): void {

    var answers = this.storageService.getItem('answers');

    if (!answers) {
      answers = "[]";
    }

    let existingAnswers = JSON.parse(answers);
    existingAnswers.push(answer);
    this.storageService.setItem('answers', JSON.stringify(existingAnswers));
  }

}
