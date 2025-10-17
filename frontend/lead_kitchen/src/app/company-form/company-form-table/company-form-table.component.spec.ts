import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyFormTableComponent } from './company-form-table.component';

describe('CompanyFormTableComponent', () => {
  let component: CompanyFormTableComponent;
  let fixture: ComponentFixture<CompanyFormTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompanyFormTableComponent]
    });
    fixture = TestBed.createComponent(CompanyFormTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
