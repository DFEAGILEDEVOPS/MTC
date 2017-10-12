import { Component, AfterViewInit } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { AuditService } from '../services/audit/audit.service';

@Component({
  selector: 'app-warmup-loading',
  templateUrl: './warmup-loading.component.html',
  styles: []
})
export class WarmupLoadingComponent extends LoadingComponent implements AfterViewInit {

  constructor(auditService: AuditService) {
    super(auditService);
  }

}
