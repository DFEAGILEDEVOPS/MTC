import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  @Input() breadcrumbs: any[];

  constructor() {
  }

  ngOnInit() {
    if (this.breadcrumbs && Array.isArray(this.breadcrumbs)) {
      return this.breadcrumbs;
    }
  }
}
