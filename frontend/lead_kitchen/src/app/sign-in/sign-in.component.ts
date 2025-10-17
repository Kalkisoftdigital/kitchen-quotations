import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../services/Login/login.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  isLoading = false;
  accountsKey = 'leadManagement';
  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService // public dialogRef: MatDialogRef<>
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

  togglePasswordVisibility(visible: boolean): void {
    this.showPassword = visible;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    passwordInput.type = this.showPassword ? 'text' : 'password';
  }

  // onSubmit() {
  //   this.submitted = true;

  //   // Stop here if form is invalid
  //   if (this.loginForm.invalid) {
  //     return;
  //   }
  //   this.isLoading = true;
  //   this.loginService.signIn(this.loginForm.value).subscribe(
  //     (response: any) => {
  //       sessionStorage.setItem(this.accountsKey, JSON.stringify(response));
  //       this.toastr.success('Sign in successfully!');
  //       this.loginService.setUserDetails(response.user);
  //       // this.dialogRef.close();
  //       if (response.user && response.user.role === 'kalkisoft') {
  //         // Handle navigation logic for 'kalkisoft' role

  //         this.router.navigate(['/kalkisoft']);

  //         // Example: Redirect to a different page or handle differently
  //       } else {
  //         // Navigate to /analytics for other roles
  //         this.router.navigate(['/analytics']);
  //       }
  //       this.isLoading = false;
  //     },
  //     (error: any) => {
  //       this.isLoading = false;
  //       if (error.status === 401 && error.error.message === 'Your account is not verified') {
  //         this.toastr.error('Your account is not verified');
  //       } else {
  //         this.toastr.error('Sign in failed! Invalid email or password.');
  //       }
  //     }
  //   );
  // }

  onSubmit() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.loginService.signIn(this.loginForm.value).subscribe(
      (response: any) => {
        sessionStorage.setItem(this.accountsKey, JSON.stringify(response));
        this.toastr.success(response.message || 'Sign in successful!');
        this.loginService.setUserDetails(response.user);

        if (response.user && response.user.role === 'kalkisoft') {
          this.router.navigate(['/kalkisoft']);
        } else {
          this.router.navigate(['/analytics']);
        }

        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading = false;

        // Check for server-provided message and display it using toastr
        if (error.error && error.error.message) {
          this.toastr.error(error.error.message); // Show server error message
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
