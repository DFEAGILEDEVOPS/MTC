import { Injectable } from '@angular/core';
import { StorageService } from './storage.service'

@Injectable()
export class AnswerService {

  constructor(private storageService: StorageService) { }

  setAnswer(answer: number) {
    this.storageService.setItem('answers', answer.toString());
  }

}
