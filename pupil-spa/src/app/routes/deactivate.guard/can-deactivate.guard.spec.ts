import { TestBed } from '@angular/core/testing'
import { deactivateGuard, CanComponentDeactivate } from './can-deactivate.guard'
import { RouterTestingModule } from '@angular/router/testing'
import { Component } from '@angular/core'

// Sample component for testing
@Component({
  template: '<div>Test Component</div>'
})
class TestComponent implements CanComponentDeactivate {
  isDirty = false

  canDeactivate(): boolean | Promise<boolean>{
    return !this.isDirty
  }
}

describe('deactivateGuard', () => {
  let component: TestComponent

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TestComponent]
    })

    component = TestBed.createComponent(TestComponent).componentInstance
  })

  it('should allow navigation when component allows it', () => {
    component.isDirty = false;

    const result = deactivateGuard(
      component,
      null!, // Current route snapshot
      null!, // Current state
      null!  // Next state
    );

    expect(result).toBe(true)
  })

  it('should prevent navigation when component is dirty', () => {
    component.isDirty = true

    const result = deactivateGuard(
      component,
      null!,
      null!,
      null!
    )

    expect(result).toBe(false)
  })


  it('should handle async deactivation check', async () => {
    // Override canDeactivate to return a Promise
    component.canDeactivate = () => Promise.resolve(true)

    const result = await deactivateGuard(
      component,
      null!,
      null!,
      null!
    )

    expect(result).toBe(true)
  })

  it('should work with components that do not implement CanComponentDeactivate', () => {
    @Component({
      template: '<div>Non-implementing Component</div>'
    })
    class NonImplementingComponent {}

    const nonImplementingComponent = TestBed.createComponent(NonImplementingComponent).componentInstance

    const result = deactivateGuard(
      nonImplementingComponent as any,
      null!,
      null!,
      null!
    );

    // Should default to denying navigation
    expect(result).toBe(true)
  })
})
