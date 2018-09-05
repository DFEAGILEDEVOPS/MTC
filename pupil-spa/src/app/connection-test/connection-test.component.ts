import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-connection-test',
  templateUrl: './connection-test.component.html',
  styleUrls: ['./connection-test.component.scss']
})
export class ConnectionTestComponent {

  constructor(private storage: StorageService) {
    // reset the feedback and preview flags when starting the test
    this.storage.setItem('feedback_given', false);
    this.storage.setItem('preview_completed', false);
  }

}
