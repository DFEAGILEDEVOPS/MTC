import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConnectionTestComponent } from './connection-test.component';
import { StorageService } from '../services/storage/storage.service';
import { ConnectionTestService } from '../services/connection-test/connection-test.service';

describe('ConnectionTestComponent', () => {
  let component: ConnectionTestComponent;
  let fixture: ComponentFixture<ConnectionTestComponent>;
  let connectionTestServiceMock;

  beforeEach(async(() => {
    connectionTestServiceMock = {
      startTest: jasmine.createSpy('startTest')
    };

    TestBed.configureTestingModule({
      declarations: [ ConnectionTestComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        StorageService,
        { provide: ConnectionTestService, useValue: connectionTestServiceMock },
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
