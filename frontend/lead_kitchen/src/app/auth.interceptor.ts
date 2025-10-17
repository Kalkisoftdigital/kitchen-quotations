// auth.interceptor.ts

import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginService } from './services/Login/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: LoginService) { }

  intercept(
    request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add authorization header with token if available
    //const authToken = JSON.parse(localStorage.getItem('leadManagement'));
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const authToken = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken.jwtToken}`,
        },
      });
    }

    return next.handle(request);
  }
}
