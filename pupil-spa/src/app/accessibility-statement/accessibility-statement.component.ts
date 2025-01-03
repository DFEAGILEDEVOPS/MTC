import { Component, OnInit, AfterViewChecked, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-accessibility-statement',
  templateUrl: './accessibility-statement.component.html',
  styleUrls: ['./accessibility-statement.component.scss']
})
export class AccessibilityStatementComponent implements OnInit, AfterViewChecked {

  @Input() fragment: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  ngAfterViewChecked(): void {
    try {
      if (this.fragment) {
        document.querySelector('#' + this.fragment).scrollIntoView();
      }
    } catch { /* empty */ }
  }

}
