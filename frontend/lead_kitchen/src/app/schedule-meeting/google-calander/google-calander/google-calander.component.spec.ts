import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleCalanderComponent } from './google-calander.component';

describe('GoogleCalanderComponent', () => {
  let component: GoogleCalanderComponent;
  let fixture: ComponentFixture<GoogleCalanderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoogleCalanderComponent]
    });
    fixture = TestBed.createComponent(GoogleCalanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
