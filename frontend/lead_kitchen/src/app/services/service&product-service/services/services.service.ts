import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private baseUrl = 'https://kitchen-backend-2.cloudjiffy.net'; // Replace with your API base URL

  constructor(private http: HttpClient) {}

  // Create a new service
  createService(serviceData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/service`, serviceData);
  }

  // Retrieve all services
  getAllServices(page: number, pageSize: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/services?page=${page}&pageSize=${pageSize}`);
  }

  getAllServicesUserId(userId: number, page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/services?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching services.');
      })
    );
  }

  getAllServicesByCompany(company: string, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/itemsList?company=${company}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching services.');
      })
    );
  }

  // getAllServicesByCompanys(company: string): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/itemsDropdown?company=${company}`).pipe(
  //     catchError((error) => {
  //       return throwError('Error fetching services.');
  //     })
  //   );
  // }

getAllServicesByCompanys(company: string): Observable<any[]> {
  const apiUrl = `${this.baseUrl}/itemsDropdown?company=${company}`;
  
  // Print the API URL and passed data
  console.log('getAllServicesByCompanys API URL:', apiUrl);
  console.log('Passed company:', company);

  return this.http.get<any[]>(apiUrl).pipe(
    tap((response: any) => {
      // Print the response when received
      console.log('API Response:', response);
    }),
    catchError((error) => {
      // Print the error if one occurs
      console.error('API Error:', error);
      return throwError('Error fetching services.');
    })
  );
}
  
  getAllServicesUserIds(userId: number, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/services?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching services.');
      })
    );
  }
  getAllServicesList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/services`);
  }
  // Retrieve a service by ID
  getServiceById(serviceId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/service/${serviceId}`);
  }

  // Update a service by ID
  updateService(serviceId: number, updatedServiceData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/service/${serviceId}`, updatedServiceData);
  }

  // Delete a service by ID and its corresponding descriptions
  deleteService(serviceId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/service/${serviceId}`).pipe(switchMap(() => this.deleteServiceDescriptions(serviceId)));
  }

  // Delete service descriptions for the given service ID
  private deleteServiceDescriptions(descriptionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/service/description/${descriptionId}`);
  }
  // ---------------------------- service description----------------------------
  // Create a new service description
  createServiceDescription(serviceId: number, descriptionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/service/${serviceId}/description`, descriptionData);
  }

  // Retrieve all service descriptions for a service
  getAllServiceDescriptions(serviceId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/service/${serviceId}/descriptions`);
  }

  // Retrieve a service description by ID
  getServiceDescriptionById(descriptionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/service/description/${descriptionId}`);
  }

  // Update a service description by ID
  updateServiceDescription(descriptionId: number, updatedDescriptionData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/service/description/${descriptionId}`, updatedDescriptionData);
  }

  // Delete a service description by ID
  deleteServiceDescription(descriptionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/service/description/${descriptionId}`);
  }
}
