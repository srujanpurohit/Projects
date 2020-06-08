import { TestBed } from '@angular/core/testing';

import { NgNetworkStateService } from './ng-network-state.service';

describe('NgNetworkStateService', () => {
  let service: NgNetworkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgNetworkStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
