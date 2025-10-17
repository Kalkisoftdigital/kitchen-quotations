import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KalkisoftDashboardComponent } from './kalkisoft-dashboard.component';

describe('KalkisoftDashboardComponent', () => {
  let component: KalkisoftDashboardComponent;
  let fixture: ComponentFixture<KalkisoftDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KalkisoftDashboardComponent]
    });
    fixture = TestBed.createComponent(KalkisoftDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
