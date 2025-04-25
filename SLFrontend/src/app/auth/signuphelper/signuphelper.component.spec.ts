import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignuphelperComponent } from './signuphelper.component';

describe('SignuphelperComponent', () => {
  let component: SignuphelperComponent;
  let fixture: ComponentFixture<SignuphelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignuphelperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignuphelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
