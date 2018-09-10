import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-familiarisation-colour',
  templateUrl: './familiarisation-colour.component.html',
  styleUrls: ['./familiarisation-colour.component.scss']
})
export class FamiliarisationColourComponent {
  constructor(private router: Router) {}

  onClick() {
    this.router.navigate(['sign-in-success']);
  }
}
