import { TestBed } from '@angular/core/testing';

import { AnamaoliesdetectService } from './anamaoliesdetect.service';

describe('AnamaoliesdetectService', () => {
  let service: AnamaoliesdetectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnamaoliesdetectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
