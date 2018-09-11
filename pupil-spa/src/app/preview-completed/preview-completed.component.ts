import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-preview-completed',
  templateUrl: './preview-completed.component.html',
  styleUrls: ['./preview-completed.component.scss']
})
export class PreviewCompletedComponent {
  private feedbackGiven: Boolean;

  constructor(private route: ActivatedRoute) {
    this.feedbackGiven = this.route.snapshot.paramMap.get('feedbackGiven') === 'true' ? true : false;
  }

}
