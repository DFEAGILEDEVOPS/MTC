import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-preview-completed',
  templateUrl: './preview-completed.component.html',
  styleUrls: ['./preview-completed.component.scss']
})
export class PreviewCompletedComponent {
  private feedbackGiven: Boolean;

  constructor(private storage: StorageService) {
    this.feedbackGiven = this.storage.getItem('feedback_given') === true;
  }

}
