import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

  @Input()
  // TODO: fetch count from other entity
  count = 20;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onClick() {
    this.router.navigate(['check']);
  }

}
