import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NetworkInformation,
  NetworkChangeEvent,
} from './ng-network-state.model';

@Injectable({
  providedIn: 'root',
})
export class NgNetworkStateService {
  constructor() {}
  private _connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  connectionChange: Observable<NetworkInformation> = new Observable(
    observer => {
      observer.next({
        downlink: this._connection.downlink,
        downlinkMax: this._connection.downlinkMax,
        effectiveType: this._connection.effectiveType,
        rtt: this._connection.rtt,
        saveData: this._connection.saveData,
        type: this._connection.type,
      });
      this._connection.onchange = (event: NetworkChangeEvent) => {
        observer.next(event.target);
      };
    }
  );

  stateBroadcaster: Observable<'online' | 'offline'> = new Observable(
    observer => {
      observer.next(this.state);
      window.addEventListener('online', () => {
        observer.next('online');
      });
      window.addEventListener('offline', () => {
        observer.next('offline');
      });
    }
  );

  get state() {
    return window.navigator.onLine ? 'online' : 'offline';
  }
}
