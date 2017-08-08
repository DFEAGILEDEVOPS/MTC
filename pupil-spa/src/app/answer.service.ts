import { Injectable } from '@angular/core';
import { StorageService} from './storage.service'

@Injectable()
export class AnswerService {

  constructor(storageService : StorageService) { }

  setAnswer(answer : number) {
    localStorage.setItem('answer', answer.toString());
  }

}
