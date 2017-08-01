import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onClick() {
    this.router.navigate(['warm-up-intro']);
  }

}
