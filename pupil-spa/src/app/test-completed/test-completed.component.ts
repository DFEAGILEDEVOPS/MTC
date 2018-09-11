import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-test-completed',
  templateUrl: './test-completed.component.html',
  styleUrls: ['./test-completed.component.scss']
})
export class TestCompletedComponent {
  private testSuccessful: Boolean;

  constructor(private storage: StorageService) {
    this.testSuccessful = this.storage.getItem('test_status') === true;
  }

}
