import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

export class Answer {

  constructor(
    public factor1: number,
    public factor2: number,
    public answer: number) { }
}

@Injectable()
export class AnswerService {

  constructor(private storageService: StorageService) { }

  setAnswer(answer: Answer): void {

    let answers = this.storageService.getItem('answers');

    if (!answers) {
      answers = [];
    }

    answers.push(answer);
    this.storageService.setItem('answers', answers);
  }

}
