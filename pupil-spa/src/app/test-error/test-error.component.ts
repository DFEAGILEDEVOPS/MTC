import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-error',
  templateUrl: './test-error.component.html',
  styleUrls: ['./test-error.component.scss']
})
export class TestErrorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    throw new Error('Pupil SPA Front end test error');
  }
}
