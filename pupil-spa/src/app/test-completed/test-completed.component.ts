import { Component } from '@angular/core';

@Component({
  selector: 'app-test-completed',
  templateUrl: './test-completed.component.html',
  styleUrls: ['./test-completed.component.scss']
})
export class TestCompletedComponent {
  private testSuccessful: Boolean;

  constructor() { }

}
