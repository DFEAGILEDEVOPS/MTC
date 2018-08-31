import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-test-completed',
  templateUrl: './test-completed.component.html',
  styleUrls: ['./test-completed.component.scss']
})
export class TestCompletedComponent {
  private testSuccessful: Boolean;

  constructor(private route: ActivatedRoute) {
    this.testSuccessful = this.route.snapshot.paramMap.get('success') === 'true' ? true : false;
  }

}
