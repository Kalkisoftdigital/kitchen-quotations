import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private baseUrl = 'https://kitchen-backend-2.cloudjiffy.net'; 

  constructor(private http: HttpClient) {}
  
  private customerAddedSource = new Subject<void>();

  customerAdded$ = this.customerAddedSource.asObservable();



  notifyCustomerAdded() {
    this.customerAddedSource.next();
  }


  getAllCustomerbyCompany(userId: number, page: number, pageSize: number, userRole: string, loginCompany?: string): Observable<any> {
    let url = `${this.baseUrl}/allUserslist?page=${page}&pageSize=${pageSize}&userRole=${userRole}`;
  
    // Adjust URL based on role and available parameters
    if (userRole === 'superadmin' && loginCompany) {
      url += `&loginCompany=${loginCompany}`;
    } else if (userRole === 'manager' && loginCompany) {
      url += `&loginCompany=${loginCompany}`;
    } else if (userRole === 'executive' && loginCompany) {
      url += `&loginCompany=${loginCompany}`;
    } else if (userRole !== 'superadmin' && userId) {
      url += `&userId=${userId}`;
    }
  
    return this.http.get(url).pipe(
      catchError((error) => {
        throw 'Error fetching Customers: ' + error;
      })
    );
  }
  
  getAllCustomersss(userId: number, page: number, pageSize: number, userRole: string, loginCompany?: string): Observable<any> {
    let url = `${this.baseUrl}/usersAll?page=${page}&pageSize=${pageSize}&userRole=${userRole}`;
    if (userRole === 'superadmin' && loginCompany) {
      url += `&loginCompany=${loginCompany}`;
    } else if (userRole !== 'superadmin' && userId) {
      url += `&userId=${userId}`;
    }
    return this.http.get(url).pipe(
      catchError((error) => {
        throw 'Error fetching Customers: ' + error;
      })
    );
  }
  
  // Add this method to your Angular service
getCustomersByCompany(loginCompany: string): Observable<any> {
  const url = `${this.baseUrl}/customersByCompany?loginCompany=${encodeURIComponent(loginCompany)}`;
  return this.http.get(url).pipe(
    catchError((error) => {
      
      throw 'Error fetching customers by company: ' + error;
    })
  );
}

  getAllCustomersUserId(userId: number, page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching Customers.');
      })
    );
  }
  getAllCustomersUserIds(userId: number, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching Customers.');
      })
    );
  }
  // Fetch a single customer by ID
  getCustomerById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${id}`).pipe(
      catchError(error => {
        throw 'Error fetching customer: ' + error;
      })
    );
  }
  getCustomerByIds(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`).pipe(
      catchError(error => {
        throw 'Error fetching customer: ' + error;
      })
    );
  }
  // Create a new customer
  createCustomer(customerData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user`, customerData).pipe(
      catchError(error => {
        const errorMessage = error.error.message || 'Error creating customer. Please try again.';
        return throwError(errorMessage);
      })
    );
  }

  // Update an existing customer
  updateCustomer(id: number, customerData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${id}`, customerData).pipe(
      catchError(error => {
        const errorMessage = error.error.message || 'Error updating customer. Please try again.';
        return throwError(errorMessage);
      })
    );
  }

  // Delete a customer by ID
  deleteCustomer(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/${id}`).pipe(
      catchError(error => {
        throw 'Error deleting customer: ' + error;
      })
    );
  }
  importExcelFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/importExcel`, formData);
  }
  // importExcelFile(file: File, userId: number): Observable<any> {
  //   const formData: FormData = new FormData();
  //   formData.append('excelFile', file, file.name);
  //   formData.append('login_id', userId.toString());

  //   return this.http.post<any>(`${this.baseUrl}/importExcel`, formData);
  // }
}
