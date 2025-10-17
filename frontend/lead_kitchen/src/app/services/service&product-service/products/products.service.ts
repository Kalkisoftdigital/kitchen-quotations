import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private baseUrl = 'https://kitchen-backend-2.cloudjiffy.net'; // Replace with your API base URL

  constructor(private http: HttpClient) {}

  private productAddedSource = new BehaviorSubject<boolean>(false);
  productAdded$ = this.productAddedSource.asObservable();

  notifyproductAdded() {
    this.productAddedSource.next(true);
  }
  // Create a new product

  createProduct(productData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/product`, productData).pipe(
      catchError((error) => {
        throw 'Error creating product: ' + error;
      }),
      tap(() => this.notifyproductAdded()) // Notify subscribers after successful creation
    );
  }
  // Retrieve all products

  getAllProducts(page: number, pageSize: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/products?page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        throw 'Error fetching products: ' + error;
      })
    );
  }

  getAllProductsUserId(userId: number, page: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/products?userId=${userId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError((error) => {
        return throwError('Error fetching products.');
      })
    );
  }

  getAllProductsList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`);
  }

  // Retrieve a product by ID
  getProductById(productId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/product/${productId}`).pipe(
      catchError((error) => {
        throw 'Error fetching product: ' + error;
      })
    );
  }
  getCategoryById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/category/${id}`).pipe(
      catchError((error) => {
        throw 'Error fetching product: ' + error;
      })
    );
  }
  // Update a product by ID

  updateProduct(productId: number, updatedproductData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/product/${productId}`, updatedproductData).pipe(
      catchError((error) => {
        throw 'Error updating product: ' + error;
      })
    );
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/product/${productId}`).pipe(
      catchError((error) => {
        throw 'Error deleting product: ' + error;
      })
    );
  }
}
