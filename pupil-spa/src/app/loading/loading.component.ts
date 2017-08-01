import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
// to be imported from config
const countdown = 2000;

export class LoadingComponent implements AfterViewInit {


  constructor(private router: Router) {}

  ngAfterViewInit() {
    window.setTimeout(() => this.router.navigate(['warm-up-question']), countdown)
  }
}
