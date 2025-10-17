import { TestBed } from '@angular/core/testing';

import { StateCityService } from './state-city.service';

describe('StateCityService', () => {
  let service: StateCityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateCityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
