import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperFormComponent } from './helper-form.component';

describe('HelperFormComponent', () => {
  let component: HelperFormComponent;
  let fixture: ComponentFixture<HelperFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelperFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
