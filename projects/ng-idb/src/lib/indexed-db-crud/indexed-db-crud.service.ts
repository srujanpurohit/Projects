import { Observable, Observer, forkJoin, throwError } from 'rxjs';
import { IDBQuery } from '../ng-idb.model';
import { mergeMap } from 'rxjs/operators';

export class IndexedDbCRUDService {
  constructor() {}

  read(
    db: IDBDatabase,
    objectStoreName: string,
    key?: IDBQuery
  ): Observable<any> {
    const objectStore = db
      .transaction(objectStoreName, 'readonly')
      .objectStore(objectStoreName);
    let request;
    if (key) {
      request = objectStore.get(key);
    } else {
      request = objectStore.getAll();
    }
    return this.returnObservable(request);
  }

  readFromIndex(
    db: IDBDatabase,
    objectStoreName: string,
    indexName: string,
    key?: IDBQuery
  ): Observable<any> {
    const request = db
      .transaction(objectStoreName, 'readonly')
      .objectStore(objectStoreName)
      .index(indexName)
      .get(key);
    return this.returnObservable(request);
  }

  write(
    db: IDBDatabase,
    objectStoreName: string,
    data: any | any[]
  ): Observable<IDBValidKey> {
    const objectStore = db
      .transaction(objectStoreName, 'readwrite')
      .objectStore(objectStoreName);
    const requests: Observable<undefined>[] = [];
    if (Array.isArray(data)) {
      data.forEach(elem => {
        requests.push(this.returnObservable(objectStore.add(elem)));
      });
    } else {
      requests.push(this.returnObservable(objectStore.add(data)));
    }
    return forkJoin(requests);
  }

  update(
    db: IDBDatabase,
    objectStoreName: string,
    key: IDBValidKey,
    data: any,
    type: 'put' | 'patch'
  ): Observable<IDBValidKey> {
    if (!type) {
      return throwError('update request type not defined');
    }
    return this.read(db, objectStoreName, key).pipe(
      mergeMap(document => {
        if (document) {
          if (type === 'patch') {
            data = { ...document, ...data };
          }
          return this.returnObservable(
            db
              .transaction(objectStoreName, 'readwrite')
              .objectStore(objectStoreName)
              .put(data)
          );
        } else {
          return throwError('document not found for this key');
        }
      })
    );
  }

  delete(
    db: IDBDatabase,
    objectStoreName: string,
    id: string
  ): Observable<undefined> {
    const request = db
      .transaction(objectStoreName, 'readwrite')
      .objectStore(objectStoreName)
      .delete(id);
    return this.returnObservable(request);
  }

  count(
    db: IDBDatabase,
    objectStoreName: string,
    query?: IDBQuery
  ): Observable<number> {
    const request = db
      .transaction(objectStoreName, 'readwrite')
      .objectStore(objectStoreName)
      .count(query);
    return this.returnObservable(request);
  }

  clear(db: IDBDatabase, objectStoreName: string): Observable<undefined> {
    const request = db
      .transaction(objectStoreName, 'readwrite')
      .objectStore(objectStoreName)
      .clear();
    return this.returnObservable(request);
  }

  returnObservable(request: IDBRequest): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      request.onsuccess = () => {
        observer.next(request.result);
        observer.complete();
      };
      request.onerror = (event: any) => {
        if (event && event.target && event.target.error) {
          observer.error(new Error(event.target.error));
        } else {
          observer.error(new Error(event));
        }
      };
    });
  }
}
