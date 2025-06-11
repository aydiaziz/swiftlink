import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationOnboardingComponent } from './notification-onboarding.component';

describe('NotificationOnboardingComponent', () => {
  let component: NotificationOnboardingComponent;
  let fixture: ComponentFixture<NotificationOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationOnboardingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
