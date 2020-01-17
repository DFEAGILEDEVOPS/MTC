import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Answer } from './answer.model';

@Injectable()
export class AnswerService {

  constructor(private storageService: StorageService) { }

  setAnswer(answer: Answer): void {
    this.storageService.setAnswer(answer);
  }
}
