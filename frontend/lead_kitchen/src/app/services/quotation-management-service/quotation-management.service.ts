import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, throwError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuotationManagementService {
  private baseUrl = 'https://kitchen-backend-2.cloudjiffy.net';
  private quotationAddedSource = new BehaviorSubject<boolean>(false);
  quotationAdded$ = this.quotationAddedSource.asObservable();

  notifyCategoryAdded() {
    this.quotationAddedSource.next(true);
  }

  constructor(private http: HttpClient) {}

  // Generic method to log API calls
  private logApiCall(method: string, url: string, data?: any) {
    console.log(`API Call: ${method} ${url}`);
    if (data) {
      console.log('Request Data:', data);
    }
  }

  // Send quotation email
  sendQuotationEmail(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/send-quotation-email`;
    const body = { quotationId };
    this.logApiCall('POST', url, body);

    return this.http.post<any>(url, body).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Send email
  sendEmail(data: { to: string; subject: string; text?: string; html?: string; attachment: any }): Observable<any> {
    const url = '/send-email';
    this.logApiCall('POST', url, data);
    
    return this.http.post<any>(url, data).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get all quotations with pagination
  getAllQuotations(page: number, pageSize: number): Observable<any> {
    const url = `${this.baseUrl}/quotations?page=${page}&pageSize=${pageSize}`;
    this.logApiCall('GET', url);
    
    return this.http.get(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get all quotations by user ID with pagination
  getAllQuotationsByUserId(userId: number, page: number, pageSize: number): Observable<any[]> {
    const url = `${this.baseUrl}/quotations?userId=${userId}&page=${page}&pageSize=${pageSize}`;
    this.logApiCall('GET', url);
    
    return this.http.get<any[]>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError('Error fetching quotations.');
      })
    );
  }

  // Get all quotations with role-based filtering
  getAllQuotationsAll(userId: number, page: number, pageSize: number, userRole: string, loginCompany?: string): Observable<any> {
    let url = `${this.baseUrl}/allQuotations?page=${page}&pageSize=${pageSize}&userRole=${userRole}`;
  
    if (userRole === 'superadmin' && loginCompany) {
      url += `&loginCompany=${loginCompany}`;
    } else if (userRole === 'manager' && loginCompany) {
      url += `&loginCompany=${loginCompany}`;
    } else if (userRole === 'executive' && loginCompany) {
      url += `&loginCompany=${loginCompany}`;
    } else if (userRole !== 'superadmin' && userId) {
      url += `&userId=${userId}`;
    }

    this.logApiCall('GET', url);
    
    return this.http.get(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        throw 'Error fetching Customers: ' + error;
      })
    );
  }

  // Get quotation by ID
  getQuotationById(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/quotation/${quotationId}`;
    this.logApiCall('GET', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get quotation with product by ID
  getquotationWithProductById(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/quotationWithProduct/${quotationId}`;
    this.logApiCall('GET', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Create a new quotation
  createQuotation(quotation: any): Observable<any> {
    const url = `${this.baseUrl}/quotation`;
    this.logApiCall('POST', url, quotation);
    
    return this.http.post<any>(url, quotation).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Create quotation with product
  createQuotationWithProduct(quotation: any): Observable<any> {
    const url = `${this.baseUrl}/quotationWithProduct`;
    this.logApiCall('POST', url, quotation);
    
    return this.http.post<any>(url, quotation).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Update quotation
  updateQuotation(quotationId: number, quotationData: any): Observable<any> {
    const url = `${this.baseUrl}/quotation/${quotationId}`;
    this.logApiCall('PUT', url, quotationData);
    
    return this.http.put(url, quotationData).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Update quotation with product
  updateQuotationWithProduct(quotationId: number, quotationData: any): Observable<any> {
    const url = `${this.baseUrl}/quotationWithProduct/${quotationId}`;
    this.logApiCall('PUT', url, quotationData);
    
    return this.http.put(url, quotationData).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Delete quotation
  deleteQuotation(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/quotation/${quotationId}`;
    this.logApiCall('DELETE', url);
    
    return this.http.delete<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Delete quotation with product
  deleteQuotationWithProduct(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/quotationWithProduct/${quotationId}`;
    this.logApiCall('DELETE', url);
    
    return this.http.delete<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get quotation descriptions
  getQuotationDescriptions(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/quotation/${quotationId}/descriptions`;
    this.logApiCall('GET', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get product descriptions
  getProductDescriptions(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/quotation/${quotationId}/products_descriptions`;
    this.logApiCall('GET', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get new quotation ID
  getNewQuotationId(): Observable<number> {
    const url = 'https://kitchen-backend-2.cloudjiffy.net/quotationId';
    this.logApiCall('GET', url);
    
    return this.http.get<number>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError('Error fetching next quotation ID');
      })
    );
  }

  // -------------------------------------------- Product Quotation Methods -------------------------------------

  // Get all product quotations with pagination
  getAllProductQuotations(page: number = 1, pageSize: number = 10): Observable<any> {
    const url = `${this.baseUrl}/product-quotations?page=${page}&pageSize=${pageSize}`;
    this.logApiCall('GET', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get all product quotations by user ID with pagination
  getAllProductQuotationsUserId(userId: number, page: number = 1, pageSize: number = 10): Observable<any[]> {
    const url = `${this.baseUrl}/product-quotations?userId=${userId}&page=${page}&pageSize=${pageSize}`;
    this.logApiCall('GET', url);
    
    return this.http.get<any[]>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError('Error fetching product-quotations.');
      })
    );
  }

  // Get product quotation by ID
  getProductQuotationById(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/product-quotation/${quotationId}`;
    this.logApiCall('GET', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Create product quotation
  createProductQuotation(data: any): Observable<any> {
    const url = `${this.baseUrl}/product-quotation`;
    this.logApiCall('POST', url, data);
    
    return this.http.post<any>(url, data).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Update product quotation
  updateProductQuotation(quotationId: number, data: any): Observable<any> {
    const url = `${this.baseUrl}/product-quotation/${quotationId}`;
    this.logApiCall('PUT', url, data);
    
    return this.http.put<any>(url, data).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError('Something went wrong while updating quotation.');
      })
    );
  }

  // Delete product quotation
  deleteProductQuotation(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/product-quotation/${quotationId}`;
    this.logApiCall('DELETE', url);
    
    return this.http.delete<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get product quotation descriptions
  getProductQuotationDescriptions(quotationId: number): Observable<any> {
    const url = `${this.baseUrl}/product-quotation/${quotationId}/descriptions`;
    this.logApiCall('GET', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Get next product quotation ID
  getNextProductQuotationId(): Observable<any> {
    const url = `${this.baseUrl}/product-quotationId`;
    this.logApiCall('GET', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Delete service from quotation
  // deleteServiceFromQuotation(quotationdescId: number, serviceId: string): Observable<any> {
  //   const url = `${this.baseUrl}/${quotationdescId}/service/${serviceId}`;
  //   this.logApiCall('DELETE', url);
    
  //   return this.http.delete(url).pipe(
  //     tap(response => console.log('Response:', response)),
  //     catchError(error => {
  //       console.error('Error:', error);
  //       return throwError(error);
  //     })
  //   );
  // }

  // Delete quotation descriptions
  deleteQuotationDescriptions(quotationId: number, quotationDescId: number): Observable<any> {
    const url = `${this.baseUrl}/quotations/${quotationId}/descriptions/${quotationDescId}`;
    this.logApiCall('DELETE', url);
    console.log(url);
    
    return this.http.delete(url).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }
}