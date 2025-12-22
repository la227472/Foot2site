import { TestBed } from '@angular/core/testing';

import { CompositorService } from './compositor.service';

describe('CompositorService', () => {
  let service: CompositorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompositorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
