import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationDialogComponent } from './quotation-dialog.component';

describe('QuotationDialogComponent', () => {
  let component: QuotationDialogComponent;
  let fixture: ComponentFixture<QuotationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuotationDialogComponent]
    });
    fixture = TestBed.createComponent(QuotationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
