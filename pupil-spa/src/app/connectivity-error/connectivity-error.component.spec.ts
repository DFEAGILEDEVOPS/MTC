import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ConnectivityErrorComponent } from './connectivity-error.component';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { ConnectivityService } from '../services/connectivity-service/connectivity-service';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ConnectivityErrorComponent', () => {
  let component: ConnectivityErrorComponent;
  let fixture: ComponentFixture<ConnectivityErrorComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ NO_ERRORS_SCHEMA ],
      declarations: [ ConnectivityErrorComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        AzureQueueService,
        ConnectivityService,
        { provide: QUEUE_STORAGE_TOKEN, useValue: undefined },
      ]
    })
    .compileComponents();
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectivityErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
