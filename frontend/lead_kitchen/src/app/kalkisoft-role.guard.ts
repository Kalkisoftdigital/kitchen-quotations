import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './services/Login/login.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class kalkisoft implements CanActivate {
  constructor(private toastr: ToastrService) {}

  canActivate(): boolean {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userRole = user?.user?.role || null;

    if (userRole !== 'kalkisoft') {
      // Redirect or handle access denial as needed
      this.toastr.error('You are not allowed to access this URL');
      return false;
    }
    return true;
  }
}
