import { NgModule, ModuleWithProviders } from '@angular/core';
import { DBCreationOptions, configToken } from './ng-idb.model';
import { NgIDBService } from './ng-idb.service';
import { IndexedDbCRUDService } from './indexed-db-crud/indexed-db-crud.service';

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
})
export class NgIDBModule {
  static forRoot(
    DBConfig: DBCreationOptions
  ): ModuleWithProviders<NgIDBModule> {
    return {
      ngModule: NgIDBModule,
      providers: [
        NgIDBService,
        IndexedDbCRUDService,
        { provide: configToken, useValue: DBConfig },
      ],
    };
  }
}
