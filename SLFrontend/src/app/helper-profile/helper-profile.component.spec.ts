import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperProfileComponent } from './helper-profile.component';

describe('HelperProfileComponent', () => {
  let component: HelperProfileComponent;
  let fixture: ComponentFixture<HelperProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelperProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelperProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
