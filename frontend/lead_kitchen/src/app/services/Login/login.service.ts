import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { User } from 'src/app/models/user-login.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'https://kitchen-backend-2.cloudjiffy.net';

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userDetailsSubject = new BehaviorSubject<any>(null);
  userDetails$ = this.userDetailsSubject.asObservable();

  private customerAddedSource = new Subject<void>();
  customerAdded$ = this.customerAddedSource.asObservable();

  constructor(private http: HttpClient) {
    // Initialize isLoggedIn flag based on session storage or local storage
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    this.isLoggedInSubject.next(isLoggedIn ? JSON.parse(isLoggedIn) : false);

    const storedUserDetails = sessionStorage.getItem('userDetails');
    if (storedUserDetails) {
      this.userDetailsSubject.next(JSON.parse(storedUserDetails));
    }
  }
  isLoggedIn(): boolean {
    return sessionStorage.getItem('leadManagement') !== null;
  }

  notifyCustomerAdded() {
    this.customerAddedSource.next();
  }

  setUserDetails(userDetails: any): void {
    sessionStorage.setItem('userDetails', JSON.stringify(userDetails));
    this.userDetailsSubject.next(userDetails);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, user);
  }

  signIn(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signin`, credentials).pipe(
      tap((response: any) => {
        sessionStorage.setItem('isLoggedIn', 'true');
        this.isLoggedInSubject.next(true);
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('isLoggedIn');
    this.isLoggedInSubject.next(false);
    // Other logic after logout
    this.userDetailsSubject.next(null);
  }

  getUserDetails(): Observable<any> {
    return this.userDetailsSubject.asObservable();
  }
  // Fetch all customers


  getAllUsers(userId: number, page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/signup?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching Customers.');
      })
    );
  }
  getAllUserss(userId: number, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/signup?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching Customers.');
      })
    );
  }
  // Method to get user by ID
  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/signup/${userId}`).pipe(
      catchError((error) => {
        throw 'Error fetching customer: ' + error;
      })
    );
  }

  // Method to update user

  updateUser(userId: number, userData: any): Observable<any> {
    // Ensure to update the status value in the userData object before sending it to the server
    userData.status = userData.status ? 'active' : 'inactive';
    return this.http.put<any>(`${this.apiUrl}/signup/${userId}`, userData).pipe(
      catchError((error) => {
        throw 'Error updating customer: ' + error;
      })
    );
  }

  // Method to delete user
  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/signup/${userId}`);
  }

  // Method to toggle user status

  toggleUserStatus(userId: number, currentStatus: string): Observable<any> {
    // Determine the new status to send
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // Send the status as an object with a 'status' property
    return this.http.put<any>(`${this.apiUrl}/toggle-status/${userId}`, { status: newStatus }).pipe(
      tap(() => {
        // Update status in userDetailsSubject locally upon successful toggle
        const currentUserDetails = this.userDetailsSubject.value;
        if (currentUserDetails) {
          const updatedUserDetails = { ...currentUserDetails, status: newStatus };
          this.userDetailsSubject.next(updatedUserDetails);
        }
      }),
      catchError((error) => {
        throw 'Error toggling user status: ' + error;
      })
    );
  }

  getNextUserId(): Observable<any> {
    const url = `${this.apiUrl}/nextUserId`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  // Handle errors from the backend
  private handleError(error: any): Observable<never> {
    return throwError(() => new Error(error.message || 'Server Error'));
  }

  getAllCompanies(page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching companies. Please try again later.');
      })
    );
  }

  
  getActiveCompanies(page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active-companies?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching companies. Please try again later.');
      })
    );
  }
}
