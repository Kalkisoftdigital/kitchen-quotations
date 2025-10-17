import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatesCitiesService {
  private apiUrl = 'https://kitchen-backend-2.cloudjiffy.net'; 
  
  private stateAddedSource = new BehaviorSubject<boolean>(false);
  stateAdded$ = this.stateAddedSource.asObservable();


  notifyCategoryAdded() {
    this.stateAddedSource.next(true);
  }


  constructor(private http: HttpClient) {}

  getAllStates(page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/states?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        throw 'Error fetching states: ' + error;
      })
    );
  }


  getStateById(stateId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/states/${stateId}`).pipe(
      catchError((error) => {
        throw 'Error fetching state: ' + error;
      })
    );
  }

  createState(state: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/states`, state);
  }

  updateState(stateId: number, state: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/states/${stateId}`, state);
  }

  deleteState(stateId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/states/${stateId}`);
  }

  getAllCities(page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cities?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        throw 'Error fetching cities: ' + error;
      })
    );
  }

  getCityById(cityId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cities/${cityId}`).pipe(
      catchError((error) => {
        throw 'Error fetching city: ' + error;
      })
    );
  }

  createCity(city: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cities`, city);
  }

  updateCity(cityId: number, city: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cities/${cityId}`, city);
  }

  deleteCity(cityId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cities/${cityId}`);
  }
}
