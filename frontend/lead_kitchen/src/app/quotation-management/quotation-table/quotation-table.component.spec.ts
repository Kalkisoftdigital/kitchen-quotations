import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationTableComponent } from './quotation-table.component';

describe('QuotationTableComponent', () => {
  let component: QuotationTableComponent;
  let fixture: ComponentFixture<QuotationTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuotationTableComponent]
    });
    fixture = TestBed.createComponent(QuotationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
