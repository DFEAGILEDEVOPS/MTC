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

  setAnswer(answer: Answer): Promise<any> {

    return new Promise((resolve, reject) => {
      this.storageService.getItem('answers')
        .then((answers) => {
          if(!answers){
            answers = "[]";
          }
          let existingAnswers = JSON.parse(answers);
          existingAnswers.push(answer);
          this.storageService.setItem('answers', JSON.stringify(existingAnswers));
          resolve();
        }).catch((err) => {
          reject(err);
        });
    })
  }

}
