import { TestBed } from '@angular/core/testing';

import { IndexedDbCRUDService } from './indexed-db-crud.service';

describe('IndexDbCRUDService', () => {
  let service: IndexedDbCRUDService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDbCRUDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
