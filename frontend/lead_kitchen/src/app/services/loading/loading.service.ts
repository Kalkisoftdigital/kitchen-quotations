import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  public showLoader=new BehaviorSubject(false);
  constructor() { }

  display(value: boolean){
    this.showLoader.next(value);
  }
}
