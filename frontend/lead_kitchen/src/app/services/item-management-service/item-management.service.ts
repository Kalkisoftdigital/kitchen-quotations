import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ItemManagementService {
  private baseUrl = 'https://kitchen-backend-2.cloudjiffy.net';

  constructor(private http: HttpClient) {}

  private categoryAddedSource = new BehaviorSubject<boolean>(false);
  categoryAdded$ = this.categoryAddedSource.asObservable();

  notifyCategoryAdded() {
    this.categoryAddedSource.next(true);
  }
  // ------------------------------------categories------------------------------------------------

  // Fetch all categories with pagination
  getAllCategories(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        throw 'Error fetching categories: ' + error;
      })
    );
  }
  getAllCategoriesUserId(userId: number, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching categories.');
      })
    );
  }
  getAllCategoriesByCompany(company: string, page: number, pageSize: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categoriesList?company=${company}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching services.');
      })
    );
  }
  getActiveCategories(sessionLogCatId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/active/${sessionLogCatId}`).pipe(
      catchError((error) => {
        throw 'Error fetching active categories: ' + error;
      })
    );
  }

  getActiveCategoriesByCompany(company: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categoriesList/active`, {
      params: {
        company: company
      }
    }).pipe(
      catchError((error) => {
        return throwError('Error fetching active categories.');
      })
    );
  }
  
  // Fetch a single category by ID
  getCategoryById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/category/${id}`).pipe(
      catchError((error) => {
        throw 'Error fetching category: ' + error;
      })
    );
  }

  // Create a new category
  createCategory(categoryData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/category`, categoryData).pipe(
      catchError((error) => {
        throw 'Error creating category: ' + error;
      }),
      tap(() => this.notifyCategoryAdded()) // Notify subscribers after successful creation
    );
  }

  // Update an existing category
  updateCategory(id: number, categoryData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/category/${id}`, categoryData).pipe(
      catchError((error) => {
        throw 'Error updating category: ' + error;
      }),
      tap(() => this.notifyCategoryAdded())
    );
  }

  // Delete a category by ID
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/category/${id}`).pipe(
      catchError((error) => {
        throw 'Error deleting category: ' + error;
      })
    );
  }

  // ------------------------------------categories------------------------------------------------
}
