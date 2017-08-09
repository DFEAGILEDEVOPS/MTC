import { TestBed, inject } from '@angular/core/testing';
import { Answer, AnswerService } from './answer.service';
import { StorageService, StorageKey } from './storage.service';

let service: AnswerService;
let storageService: StorageService;

describe('AnswerService', () => {

  const shouldNotExecute = () => {
    expect('this code not').toBe('executed');
  };

  beforeEach((done) => {
    const injector = TestBed.configureTestingModule({
      providers: [AnswerService, StorageService]
    });
    localStorage.clear();

    storageService = injector.get(StorageService);
    service = new AnswerService(storageService);
    done();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should append answer to answers object in storage service', (done) => {
    const answer1 = new Answer(1, 1, 1);
    const answer2 = new Answer(2, 2, 2);
    const existingAnswers = JSON.stringify([answer1, answer2]);
    storageService.setItem('answers', existingAnswers);
    const answer3 = new Answer(3, 3, 3);
    const expected = JSON.stringify([answer1, answer2, answer3]);

    service.setAnswer(answer3)
      .then(() => {
        storageService.getItem('answers')
          .then((actual) => {
            expect(actual).toBe(expected);
            done();
          });
      })
      .catch((err) => {
        shouldNotExecute();
        done();
      });
  });

  it('should create answers object if it does not already exist', (done) => {

    const answer1 = new Answer(1, 1, 1);
    const expected = JSON.stringify([answer1]);

    service.setAnswer(answer1)
      .then(() => {
        storageService.getItem('answers')
          .then((actual) => {
            expect(actual).toBe(expected);
            done();
          });
      })
      .catch((err) => {
        shouldNotExecute();
        done();
      });
  });

});
