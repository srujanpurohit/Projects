import { TestBed } from '@angular/core/testing';

import { NgIDBService } from './ng-idb.service';

describe('NgIDBService', () => {
  let service: NgIDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgIDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
