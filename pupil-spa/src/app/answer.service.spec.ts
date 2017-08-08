import { TestBed, inject } from '@angular/core/testing';
import { AnswerService } from './answer.service';
import { StorageService } from './storage.service';


let service: AnswerService;

describe('AnswerService', () => {

  const shouldNotExecute = () => {
    expect(1).toBe(2);
  };

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [AnswerService, StorageService]
    });
    localStorage.clear();
    service = injector.get(AnswerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should persist answers to local storage via the storage service', () => {
    spyOn(localStorage, 'setItem');

    service.setAnswer(42);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should append answer to answers object in storage', () => {

  });

});
