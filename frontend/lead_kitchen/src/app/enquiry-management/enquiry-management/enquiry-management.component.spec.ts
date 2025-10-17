import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryManagementComponent } from './enquiry-management.component';

describe('EnquiryManagementComponent', () => {
  let component: EnquiryManagementComponent;
  let fixture: ComponentFixture<EnquiryManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnquiryManagementComponent]
    });
    fixture = TestBed.createComponent(EnquiryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
