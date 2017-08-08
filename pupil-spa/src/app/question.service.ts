import { Injectable } from '@angular/core';
import { Question } from './question.model';

@Injectable()
export class QuestionService {

  private questions;

  constructor() {
    // TODO: depend on StorageClass rather than calling localStorage directly.
    let data = localStorage.getItem('data');
    this.questions = data['questions'];
  }

  public getNumberOfQuestions(): number {
    return this.questions.length;
  }

  public getQuestion(sequenceNumber: number): Question {

    // The Number type in Typescript is a float, so this could be a decimal.
    if (!Number.isInteger(sequenceNumber)) {
      throw new Error('sequenceNumber is not an integer');
    }

    const data = this.questions[sequenceNumber - 1];
    const last = this.getNumberOfQuestions();

    // Bounds check
    if (sequenceNumber > last || sequenceNumber < 0) {
      throw new Error(`Out of range: question ${sequenceNumber} does not exist`);
    }

    const question = new Question(
      data['factor1'],
      data['factor2'],
      sequenceNumber
    );

    return question;
  }

  getNextQuestionNumber(currentQuestionNumber: number): number {
    // The Number type in Typescript is a float, so this could be a decimal.
    if (!Number.isInteger(currentQuestionNumber)) {
      throw new Error('currentQuestionNumber is not an integer');
    }

    if (currentQuestionNumber === this.getNumberOfQuestions()) {
      // we are already on the last question, there isn't another question number.
      return null;
    }

    return currentQuestionNumber + 1;
  }
}
