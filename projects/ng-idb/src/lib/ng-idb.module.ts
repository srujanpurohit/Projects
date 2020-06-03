import { NgModule, ModuleWithProviders } from '@angular/core';
import { DBCreationOptions, configToken } from './ng-idb.model';
import { NgIDBService } from './ng-idb.service';

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
      providers: [NgIDBService, { provide: configToken, useValue: DBConfig }],
    };
  }
}
