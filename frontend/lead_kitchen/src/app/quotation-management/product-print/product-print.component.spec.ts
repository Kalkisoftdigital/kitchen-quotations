import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPrintComponent } from './product-print.component';

describe('ProductPrintComponent', () => {
  let component: ProductPrintComponent;
  let fixture: ComponentFixture<ProductPrintComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductPrintComponent]
    });
    fixture = TestBed.createComponent(ProductPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
