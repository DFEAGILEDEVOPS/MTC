import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AccessibilityStatementComponent } from './accessibility-statement.component';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-header',
    template: '',
    standalone: false
})
export class MockAppHeaderComponent {
}

@Component({
    selector: 'app-breadcrumbs',
    template: '',
    standalone: false
})
export class MockAppBreadcrumbsComponent {
  @Input() breadcrumbs: any[];
}

@Component({
    selector: 'app-footer',
    template: '',
    standalone: false
})
export class MockAppFooterComponent {
}

describe('AccessibilityStatementComponent', () => {
  let component: AccessibilityStatementComponent;
  let fixture: ComponentFixture<AccessibilityStatementComponent>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    mockActivatedRoute = {
      fragment: of(null)
    };

    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ AccessibilityStatementComponent, MockAppBreadcrumbsComponent, MockAppHeaderComponent, MockAppFooterComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccessibilityStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
