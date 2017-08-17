import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-check-complete',
  templateUrl: './check-complete.component.html',
  styleUrls: ['./check-complete.component.css']
})
export class CheckCompleteComponent implements OnInit {

  /**
   * Prevent Backspace doing anything while the load-page is showing - some browsers will
   * go back a page.
   *
   * @param {KeyboardEvent} event
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log(`check-complete.component: handleKeyboardEvent() called: key: ${event.key} keyCode: ${event.keyCode}`);
    // IMPORTANT: return false here
    return false;
  }

  constructor() {
  }

  ngOnInit() {
  }

}
