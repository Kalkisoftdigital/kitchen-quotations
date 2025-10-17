import { TestBed } from '@angular/core/testing';

import { EnquiryManagementService } from './enquiry-management.service';

describe('EnquiryManagementService', () => {
  let service: EnquiryManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnquiryManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
