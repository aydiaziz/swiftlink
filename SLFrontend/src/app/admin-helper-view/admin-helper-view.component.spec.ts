import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHelperViewComponent } from './admin-helper-view.component';

describe('AdminHelperViewComponent', () => {
  let component: AdminHelperViewComponent;
  let fixture: ComponentFixture<AdminHelperViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHelperViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHelperViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
