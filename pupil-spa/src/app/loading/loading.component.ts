import { Component, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { PauseRendered } from '../services/audit/auditEntry';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent implements AfterViewInit {

  @Input()
  public question = 0;

  @Input()
  public total = 0;

  @Input()
  public loadingTimeout: number;

  @Output()
  timeoutEvent: EventEmitter<any> = new EventEmitter();

  constructor(private auditService: AuditService) {
  }

  /**
   * Prevent Backspace doing anything while the load-page is showing - some browsers will
   * go back a page.
   *
   * @param {KeyboardEvent} event
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log(`loading.component: handleKeyboardEvent() called: key: ${event.key} keyCode: ${event.keyCode}`);
    // IMPORTANT: return false here
    return false;
  }

  ngAfterViewInit() {
    // console.log('loading.component: after view init called');
    this.auditService.addEntry(new PauseRendered());
    setTimeout(() => {
      this.sendTimeoutEvent();
    }, this.loadingTimeout * 1000);
  }

  sendTimeoutEvent() {
    this.timeoutEvent.emit(null);
  }
}
