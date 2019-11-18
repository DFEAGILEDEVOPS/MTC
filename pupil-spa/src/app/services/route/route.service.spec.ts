import { TestBed, inject } from '@angular/core/testing';
import { RouteService } from './route.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

let service: RouteService;

describe('RouteService', () => {
  let mockRouter;
  let subject;

  beforeEach(() => {
    subject = new Subject();
    mockRouter = {
      subject: subject,
      events: subject.asObservable()
    };

    const injector = TestBed.configureTestingModule({
      providers: [
        RouteService,
        {provide: Router, useValue: mockRouter}
      ]
    });
    service = injector.get(RouteService);
    service.setup();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have undefined previous url before navigating twice', () => {
    expect(service.getPreviousUrl()).toBe(undefined);
    const url1 = new NavigationEnd(0, '/first-path', null);
    subject.next(url1);
    expect(service.getPreviousUrl()).toBe(undefined);
  });

  it('should have the correct previous url after naviation', () => {
    const url1 = new NavigationEnd(0, '/first-path', null);
    subject.next(url1);
    const url2 = new NavigationEnd(0, '/second-path', null);
    subject.next(url2);
    expect(service.getPreviousUrl()).toBe('/first-path');
  });
});
