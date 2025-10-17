import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './services/Login/login.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class kalkiSAdminManagerExecutive implements CanActivate {
  constructor(private toastr: ToastrService) {}

  canActivate(): boolean {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userRole = user?.user?.role || null;

    if (userRole === 'superadmin' || userRole === 'kalkisoft' || userRole === 'manager' || userRole === 'executive') {
      return true;
    } else {
      this.toastr.error('You are not allowed to access this URL');
      return false;
    }
  }
}
