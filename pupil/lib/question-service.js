const fs = require('fs');
const path = require('path');

let cache = {};

let QuestionService = function(formName) {
  let fileName = formName + '.json';

  if (!cache[formName]) {
    data = JSON.parse(fs.readFileSync(path.join(__dirname, '/../data/' + fileName)));
    if (!(data && data.questions && Array.isArray(data.questions))) {
      throw new Error('Questions not found');
    }
    cache[formName] = data;
  }

  this.data = cache[formName];
};

/**
 * Get a question
 * @param {Number} num the question number
 * @returns {Array} Position 0 is factor 1, position 2 is factor 2
 */
QuestionService.prototype.getQuestion = function (num) {
  let indexPos = num - 1;
  let questions;

  questions = this.data['questions'];

  if (num > questions.length || indexPos < 0) {
    throw new Error('Question not found');
  }

  return questions[indexPos];
};

/**
 * returns the total number of questions
 * @returns {Number}
 */
QuestionService.prototype.getNumberOfQuestions = function () {
  return this.data.questions.length;
};

/**
 * returns the next question number
 * @param {Number} num the current question number
 * @returns {Number|null} the next question number or null if this is the last question
 */
QuestionService.prototype.getNextQuestionNumber = function (num) {
  if (!num) {
    throw new Error("arg `num` not found");
  }
  return (num < this.data.questions.length ? num + 1 : null);
};

module.exports = QuestionService;
