import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject, Observer, throwError } from 'rxjs';
import { IndexedDbCRUDService } from './indexed-db-crud/indexed-db-crud.service';
import {
  ObjectStoreCreationOption,
  configToken,
  DBCreationOptions,
  DBStatus,
  IDBQuery,
} from './ng-idb.model';

import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NgIDBService {
  private _db: IDBDatabase;
  private _dbStatus: BehaviorSubject<DBStatus> = new BehaviorSubject(
    'unInitialezed'
  );

  constructor(
    private crudService: IndexedDbCRUDService,
    @Inject(configToken) private _dbCreationOptions: DBCreationOptions
  ) {
    this.init();
  }

  private _addSupportForAllBrowsers() {
    if (window && window.indexedDB) {
      return;
    } else {
      (window as any).indexedDB =
        (window as any).mozIndexedDB ||
        (window as any).webkitIndexedDB ||
        (window as any).msIndexedDB;
      window.IDBTransaction = window.IDBTransaction ||
        (window as any).webkitIDBTransaction ||
        (window as any).msIDBTransaction || { READ_WRITE: 'readwrite' };
      window.IDBKeyRange =
        window.IDBKeyRange ||
        (window as any).webkitIDBKeyRange ||
        (window as any).msIDBKeyRange;
    }
    if (!window.indexedDB) {
      throw new Error('indexedDB not supported by this browser');
    }
  }
  init() {
    if (this._dbCreationOptions) {
      if (
        !this._dbCreationOptions.name ||
        !this._dbCreationOptions.version ||
        !this._dbCreationOptions.stores ||
        !this._dbCreationOptions.stores.length
      ) {
        throw new Error(
          'name, version and stores are required to create indexedDB'
        );
      }
    } else {
      throw new Error('IndexedDBConfig is required');
    }
    this._addSupportForAllBrowsers();
    this._dbStatus.next('initiating');
    const DBOpenRequest: IDBOpenDBRequest = window.indexedDB.open(
      this._dbCreationOptions.name,
      this._dbCreationOptions.version
    );
    DBOpenRequest.onerror = () => {
      this._dbStatus.next('failed');
      throw new Error('an error occured while initiating Database');
    };
    DBOpenRequest.onsuccess = () => {
      this._db = DBOpenRequest.result;
      this._dbStatus.next('initialized');
    };
    DBOpenRequest.onupgradeneeded = (event: any) => {
      this._db = DBOpenRequest.result;
      for (const objectStore of this._dbCreationOptions.stores) {
        this._createObjectStore(objectStore);
      }
      const transaction: IDBTransaction = event.target.transaction;
      transaction.oncomplete = () => {
        this._dbStatus.next('initialized');
      };
    };
  }

  private _checkDBInitiated() {
    if (!this._db) {
      throw new Error(
        'DB not yet initialed, current Status: ' + this._dbStatus
      );
    }
  }

  closeDBConnection() {
    this._checkDBInitiated();
    this._db.close();
    this._db = null;
    this._dbStatus.next('closed');
  }

  deleteDatabase(): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.closeDBConnection();
      const request = window.indexedDB.deleteDatabase(
        this._dbCreationOptions.name
      );
      request.onblocked = () => {
        observer.error(new Error('Cannot delted. DB is blocked'));
      };
      request.onsuccess = () => {
        observer.next(true);
        observer.complete();
      };
      request.onerror = (event: any) => {
        observer.error(new Error(event));
      };
    });
  }

  private _createObjectStore({
    name,
    primaryKey,
    indexes,
  }: ObjectStoreCreationOption): IDBObjectStore {
    if (!this._db.objectStoreNames.contains(name)) {
      const objectStore = this._db.createObjectStore(name, {
        keyPath: primaryKey,
      });
      if (indexes && Array.isArray(indexes)) {
        for (const index of indexes) {
          objectStore.createIndex(index.name, index.keyPath, index.options);
        }
      }
      return objectStore;
    } else {
      throw new Error(`object store already exist with name ${name}`);
    }
  }

  deleteObjectStore(name: string) {
    this._checkDBInitiated();
    this._db.deleteObjectStore(name);
  }

  private _awaitDBInitialization(callback, arg: any[]): Observable<any> {
    return this._dbStatus.pipe(
      mergeMap((status: DBStatus) => {
        switch (status) {
          case 'initialized':
            return callback.apply(this.crudService, [this._db, ...arg]);
          case 'failed':
            return throwError('DB initialization was failed');
          case 'unInitialezed':
            return throwError('DB is not initialized');
          case 'initiating':
            break;
          case 'closed':
            return throwError(
              'DB is closed. Use init method to initiate again'
            );
          default:
            return throwError('invalid DB status recieved:' + status);
        }
      })
    );
  }

  /* APIS */

  findOne(storeName: string, query: IDBQuery): Observable<any> {
    if (!query) {
      return throwError('query is required to read');
    }
    return this._awaitDBInitialization(this.crudService.read, [
      storeName,
      query,
    ]);
  }

  findAll(storeName: string): Observable<any[]> {
    return this._awaitDBInitialization(this.crudService.read, [storeName]);
  }

  findFromIndex(objectStoreName: string, indexName: string, query?: IDBQuery) {
    return this._awaitDBInitialization(this.crudService.readFromIndex, [
      objectStoreName,
      indexName,
      query,
    ]);
  }

  count(objectStoreName: string, query?: IDBQuery) {
    return this._awaitDBInitialization(this.crudService.count, [
      objectStoreName,
      query,
    ]);
  }

  insertOne(storeName: string, data: object): Observable<IDBValidKey> {
    if (Array.isArray(data)) {
      return throwError('Got an array where object was expected');
    }
    return this._awaitDBInitialization(this.crudService.write, [
      storeName,
      data,
    ]);
  }

  insertMany(storeName: string, data: object[]): Observable<IDBValidKey[]> {
    if (!Array.isArray(data)) {
      return throwError(`Got ${typeof data} where Array was expected`);
    }
    return this._awaitDBInitialization(this.crudService.write, [
      storeName,
      data,
    ]);
  }

  put(storeName: string, key: IDBValidKey, data: any) {
    return this._awaitDBInitialization(this.crudService.update, [
      storeName,
      key,
      data,
      'put',
    ]);
  }

  patch(storeName: string, key: IDBValidKey, data: any) {
    return this._awaitDBInitialization(this.crudService.update, [
      storeName,
      key,
      data,
      'patch',
    ]);
  }

  deleteOne(storeName: string, key: string): Observable<undefined> {
    return this._awaitDBInitialization(this.crudService.delete, [
      storeName,
      key,
    ]);
  }

  deleteAll(storeName: string): Observable<undefined> {
    return this._awaitDBInitialization(this.crudService.clear, [storeName]);
  }
}
