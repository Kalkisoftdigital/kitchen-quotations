import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSendDataComponent } from './email-send-data.component';

describe('EmailSendDataComponent', () => {
  let component: EmailSendDataComponent;
  let fixture: ComponentFixture<EmailSendDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailSendDataComponent]
    });
    fixture = TestBed.createComponent(EmailSendDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
