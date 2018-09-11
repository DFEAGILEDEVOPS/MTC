import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-connection-test',
  templateUrl: './connection-test.component.html',
  styleUrls: ['./connection-test.component.scss']
})
export class ConnectionTestComponent {

  constructor(
    private storage: StorageService,
    private router: Router
  ) {
    // reset the feedback and preview flags when starting the test
    this.storage.setItem('feedback_given', false);
    this.storage.setItem('preview_completed', false);

    setTimeout(() => router.navigate(['ict-survey/test-completed']), 10000);
  }

}
