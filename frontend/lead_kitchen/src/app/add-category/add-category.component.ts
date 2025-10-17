import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { LoginService } from '../services/Login/login.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',

  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent {
  loginForm: FormGroup;
  submitted = false;
  accountsKey = 'leadManagement';
  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AddCategoryComponent>
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
  ngOnInit(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const authToken = sessionStorageData ? JSON.parse(sessionStorageData) : null;

    if (authToken && authToken.user && authToken.user.role) {
    } else {
    }
  }

  onSubmit() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loginService.signIn(this.loginForm.value).subscribe(
      (response: any) => {
        sessionStorage.setItem(this.accountsKey, JSON.stringify(response));
        this.toastr.success('Sign in successful!');
        this.loginService.setUserDetails(response.user);
        this.dialogRef.close();
        this.router.navigate(['/analytics']);
      },
      (error: any) => {
        if (error.status === 401 && error.error.message === 'Your account is not verified') {
          this.toastr.error('Your account is not verified');
        } else {
          this.toastr.error('Sign in failed! Invalid email or password.');
        }
      }
    );
  }
  onForgotPassword() {}

  onSignUp() {
    this.router.navigate(['/signup']);
  }
}
