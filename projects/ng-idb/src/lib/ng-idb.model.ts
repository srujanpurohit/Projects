import { InjectionToken } from '@angular/core';

export type IndexCreationOptions = IndexCreationOption[];

export type ObjectStoreCreationOptions = ObjectStoreCreationOption[];

export class DBCreationOptions {
  name: string;
  version: number;
  stores: ObjectStoreCreationOptions;
  constructor(
    name: string,
    version: number,
    stores: ObjectStoreCreationOptions
  ) {
    this.name = name;
    this.version = version;
    this.stores = stores;
  }
}

export class ObjectStoreCreationOption {
  name: string;
  primaryKey: string;
  indexes: IndexCreationOptions;
  constructor(
    name: string,
    primaryKey: string,
    indexes?: IndexCreationOptions
  ) {
    this.name = name;
    this.primaryKey = primaryKey;
    this.indexes = indexes;
  }
}

export class IndexCreationOption {
  name: string;
  keyPath: string | string[];
  options: IDBIndexParameters;
  constructor(
    name: string,
    keyPath: string | string[],
    options?: IDBIndexParameters
  ) {
    this.name = name;
    this.keyPath = keyPath;
    this.options = options;
  }
}

export const configToken = new InjectionToken<DBCreationOptions>(null);

export type DBStatus =
  | 'initiating'
  | 'initialized'
  | 'failed'
  | 'unInitialezed'
  | 'closed';

export type IDBQuery =
  | string
  | number
  | Date
  | ArrayBufferView
  | ArrayBuffer
  | IDBArrayKey
  | IDBKeyRange;
