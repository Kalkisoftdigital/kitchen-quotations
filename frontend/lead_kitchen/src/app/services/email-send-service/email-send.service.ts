import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailSendService {
  private baseUrl = 'https://kitchen-backend-2.cloudjiffy.net';

  constructor(private http: HttpClient) {}

  private customerAddedSource = new Subject<void>();

  customerAdded$ = this.customerAddedSource.asObservable();

  notifyCustomerAdded() {
    this.customerAddedSource.next();
  }

  // Fetch all email send data
  getAllEmailSendData(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/emailsSend?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        throw 'Error fetching email send data: ' + error;
      })
    );
  }
  getAllEmailSendDataByUserId(companyName: string, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/emailsSend?companyName=${companyName}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching emails Send.');
      })
    );
  }
  // Fetch a single email send data by ID
  getEmailSendDataById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/emailSend/${id}`).pipe(
      catchError((error) => {
        throw 'Error fetching email send data: ' + error;
      })
    );
  }

  // Create a new email send data
  createEmailSendData(emailSendData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/emailSend`, emailSendData).pipe(
      catchError((error) => {
        throw 'Error creating email send data: ' + error;
      })
    );
  }

  // Update an existing email send data
  updateEmailSendData(id: number, emailSendData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/emailSend/${id}`, emailSendData).pipe(
      catchError((error) => {
        throw 'Error updating email send data: ' + error;
      })
    );
  }

  // Delete email send data by ID
  deleteEmailSendData(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/emailSend/${productId}`).pipe(
      catchError((error) => {
        throw 'Error deleting email send data: ' + error;
      })
    );
  }
}
