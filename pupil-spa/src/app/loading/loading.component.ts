import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

// to be imported from config
const countdown = 3000;

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})

export class LoadingComponent implements AfterViewInit {

  question;
  total;

  constructor(private router: Router) {
    this.question = 1;
    this.total = 3
  }

  ngAfterViewInit() {
    window.setTimeout(() => this.router.navigate(['warm-up-question']), countdown)
  }
}
