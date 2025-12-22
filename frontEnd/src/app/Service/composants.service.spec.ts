import { TestBed } from '@angular/core/testing';

import { ComposantsService } from './composants.service';

describe('ComposantsService', () => {
  let service: ComposantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComposantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
