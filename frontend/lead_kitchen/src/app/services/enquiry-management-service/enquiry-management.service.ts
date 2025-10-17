import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { Enquiry, EnquiryDetail } from 'src/app/models/enquiry.model';

@Injectable({
  providedIn: 'root'
})
export class EnquiryManagementService {
  private apiUrl = 'https://kitchen-backend-2.cloudjiffy.net'; 

  private stateAddedSource = new BehaviorSubject<boolean>(false);
  stateAdded$ = this.stateAddedSource.asObservable();

  notifyCategoryAdded() {
    this.stateAddedSource.next(true);
  }

  constructor(private http: HttpClient) {}

  getFilteredDateItems(items: any[], filterType: string): any[] {
    const today = new Date();
    let filteredItems = [];

    switch (filterType) {
      case 'previous':
        filteredItems = items.filter((item) => new Date(item.date) < today);
        break;
      case 'today':
        filteredItems = items.filter((item) => new Date(item.date).toDateString() === today.toDateString());
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filteredItems = items.filter((item) => new Date(item.date).toDateString() === tomorrow.toDateString());
        break;
      default:
        filteredItems = items;
    }

    return filteredItems;
  }
  getAllEnquiries(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<Enquiry[]>(`${this.apiUrl}/enquiries?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        throw 'Error fetching enquiries: ' + error;
      })
    );
  }

  getAllEnquiriesUserId(userId: number, page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/enquiries?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching enquiries.');
      })
    );
  }

  getAllEnquiriesByUserId(userId: number, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/enquiries?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching enquiries.');
      })
    );
  }
  getEnquiryById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/enquiry/${userId}`).pipe(
      catchError((error) => {
        throw 'Error fetching customer: ' + error;
      })
    );
  }

  createEnquiry(enquiry: Enquiry): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enquiry`, enquiry);
  }

  updateEnquiry(id: number, enquiry: Enquiry): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/enquiry/${id}`, enquiry);
  }

  deleteEnquiry(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/enquiry/${id}`);
  }

  // CRUD operations for EnquiryDetail

  getEnquiryDetails(enquiryId: number): Observable<EnquiryDetail[]> {
    return this.http.get<EnquiryDetail[]>(`${this.apiUrl}/enquiry/${enquiryId}/details`);
  }

  // getenquiryDashboard(enquiryId: number, userId: number): Observable<EnquiryDetail[]> {
  //   return this.http.get<EnquiryDetail[]>(`${this.apiUrl}/enquiryDashboard/${enquiryId}/details`, {
  //     params: { userId: userId.toString() }
  //   });
  // }
  getenquiryDashboard(enquiryId: number, userId: number, userRole: string, loginCompany: string): Observable<EnquiryDetail[]> {
    return this.http.get<EnquiryDetail[]>(`${this.apiUrl}/enquiryDashboard/${enquiryId}/details`, {
      params: {
        userId: userId.toString(),
        userRole,
        loginCompany
      }
    });
  }
  
  getAllEnquiriess(): Observable<any> {
    return this.http.get(`${this.apiUrl}/enquiries`);
  }

  getAllEnquiriesList(userId: number, page: number, pageSize: number, userRole: string, loginCompany?: string): Observable<any> {
    let url = `${this.apiUrl}/allEnquiriesList?page=${page}&pageSize=${pageSize}&userRole=${userRole}`;
  
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
  getAllQuotations(page: number, pageSize: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/quotations?page=${page}&pageSize=${pageSize}`);
  }

  getAllProductQuotations(page: number, pageSize: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/product-quotations?page=${page}&pageSize=${pageSize}`);
  }

  createEnquiryDetail(enquiryId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enquiry/${enquiryId}/detail`, formData);
  }

  updateEnquiryDetail(detailId: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/enquiry/detail/${detailId}`, formData);
  }
  // deleteEnquiryDetail(id: number): Observable<any> {
  //   return this.http.delete<any>(`${this.apiUrl}/enquiry/detail/${id}`);
  // }
  deleteEnquiryDetail(enquiryId: number, detailId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/enquiry/${enquiryId}/detail/${detailId}`);
  }

  // -------------------------------- enquiry master -----------------------

  getAllEnquiriesMasterByUserId(userId: number, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/enquiriesMasters?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching enquiries master.');
      })
    );
  }
  getEnquiriesMasterById(sessionMasterId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/enquiriesMaster/${sessionMasterId}`).pipe(
      catchError((error) => {
        return throwError('Error fetching company. Please try again later.');
      })
    );
  }

  createEnquiriesMaster(company: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enquiriesMaster`, company).pipe(
      catchError((error) => {
        return throwError('Error creating company. Please try again later.');
      })
    );
  }

  updateEnquiriesMaster(id: number, company: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/enquiriesMaster/${id}`, company).pipe(
      catchError((error) => {
        return throwError('Error updating company. Please try again later.');
      })
    );
  }

  deleteEnquiriesMaster(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/enquiriesMaster/${id}`).pipe(
      catchError((error) => {
        return throwError('Error deleting company. Please try again later.');
      })
    );
  }

  getActiveEnquiriesMaster(loginCompany: string, page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active-enquiriesMasters?loginCompany=${loginCompany}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching EnquiriesMaster. Please try again later.');
      })
    );
  }
  // -------------------------------- enquiry master -----------------------
}
