import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  govukRoot = 'https://gov.uk';
  crownCopyrightMessage = null;

  constructor() { }

  ngOnInit() {
  }

}
