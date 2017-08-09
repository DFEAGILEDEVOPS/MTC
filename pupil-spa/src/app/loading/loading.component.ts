import { Component, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})

export class LoadingComponent implements AfterViewInit {

  @Input()
  private countdown = 2000;
  @Input()
  private question = 0;
  @Input()
  private total = 0;

  constructor(private router: Router) {
  }

  ngAfterViewInit() {
    // window.setTimeout(() => this.router.navigate(['warm-up-question']), this.countdown);
  }
}
