import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent {

  @Input()
  public question = 0;
  @Input()
  public total = 0;

  constructor() {
  }
}
