import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-submission-pending',
  templateUrl: './submission-pending.component.html',
  styleUrls: ['./submission-pending.component.scss']
})
export class SubmissionPendingComponent implements OnInit {

  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  constructor() {

  }

  ngOnInit() {
  }
}
