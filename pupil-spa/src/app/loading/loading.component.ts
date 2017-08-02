import { Component, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})

export class LoadingComponent implements AfterViewInit {

  @Input()
  countdown: number = 3000;
  question = 1;
  total = 3;

  constructor(private router: Router) {
  }

  ngAfterViewInit() {
    window.setTimeout(() => this.router.navigate(['warm-up-question']), this.countdown)
  }
}
