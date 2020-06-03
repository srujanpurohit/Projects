import { TestBed } from '@angular/core/testing';

import { IndexDbCRUDService } from './indexed-db-crud.service';

describe('IndexDbCRUDService', () => {
  let service: IndexDbCRUDService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexDbCRUDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
