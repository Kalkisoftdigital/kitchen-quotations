import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'https://kitchen-backend-2.cloudjiffy.net';

  constructor(private http: HttpClient) {}

  getAllCompanies(page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching companies. Please try again later.');
      })
    );
  }
  getAllCompaniess(page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching companies. Please try again later.');
      })
    );
  }
  getCompaniesByUserId(userId: number, page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching companies for user. Please try again later.');
      })
    );
  }
  getCompanyParticularUser(userId: number, page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching companies. Please try again later.');
      })
    );
  }

  getCompanyById(companyId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/company/${companyId}`).pipe(
      catchError((error) => {
        return throwError('Error fetching company. Please try again later.');
      })
    );
  }

  createCompany(company: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/company`, company).pipe(
      catchError((error) => {
        return throwError('Error creating company. Please try again later.');
      })
    );
  }

  updateCompany(id: number, company: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/company/${id}`, company).pipe(
      catchError((error) => {
        return throwError('Error updating company. Please try again later.');
      })
    );
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/company/${id}`).pipe(
      catchError((error) => {
        return throwError('Error deleting company. Please try again later.');
      })
    );
  }

  getCompaniesEndingSoon(page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies-ending-soon?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching companies ending soon. Please try again later.');
      })
    );
  }
}
