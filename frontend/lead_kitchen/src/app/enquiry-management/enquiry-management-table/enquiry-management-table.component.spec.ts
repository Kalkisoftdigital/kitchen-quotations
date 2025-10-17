import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryManagementTableComponent } from './enquiry-management-table.component';

describe('EnquiryManagementTableComponent', () => {
  let component: EnquiryManagementTableComponent;
  let fixture: ComponentFixture<EnquiryManagementTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnquiryManagementTableComponent]
    });
    fixture = TestBed.createComponent(EnquiryManagementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
