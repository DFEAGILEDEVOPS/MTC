import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-warmup-intro',
  templateUrl: './warmup-intro.component.html',
  styleUrls: ['./warmup-intro.component.css']
})
export class WarmupIntroComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onClick() {
    this.router.navigate(['warm-up-start']);
  }

}
