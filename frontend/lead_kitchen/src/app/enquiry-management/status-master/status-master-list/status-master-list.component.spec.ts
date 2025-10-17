import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusMasterListComponent } from './status-master-list.component';

describe('StatusMasterListComponent', () => {
  let component: StatusMasterListComponent;
  let fixture: ComponentFixture<StatusMasterListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatusMasterListComponent]
    });
    fixture = TestBed.createComponent(StatusMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
