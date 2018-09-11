import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionTestComponent } from './connection-test.component';
import { StorageService } from '../services/storage/storage.service';

describe('ConnectionTestComponent', () => {
  let component: ConnectionTestComponent;
  let fixture: ComponentFixture<ConnectionTestComponent>;
  let mockRouter;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      declarations: [ ConnectionTestComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        StorageService,
        { provide: Router, useValue: mockRouter },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
