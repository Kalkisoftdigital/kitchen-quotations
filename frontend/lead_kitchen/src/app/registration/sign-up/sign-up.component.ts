import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user-login.model';
import { LoginService } from 'src/app/services/Login/login.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  signUpForm: FormGroup;
  userId: number | undefined;
  constructor(
    private formBuilder: FormBuilder,
    private userService: LoginService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.signUpForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['admin'],
      status: [false]
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = +params['id'];
        this.editUser(this.userId);
      }
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.signUpForm.valid) {
      if (this.userId) {
        this.updateUser(this.userId);
      } else {
        this.createUser();
      }
    } else {
      this.toastr.error('Form is invalid!');
    }
  }

  createUser(): void {
    const userData = this.signUpForm.value;
    this.userService.createUser(userData).subscribe(
      (response: any) => {
        this.toastr.success('User created successfully!');

        this.router.navigate(['/registration/list']);
      },
      (error: any) => {
        this.toastr.error('Error creating user!');
      }
    );
  }

  updateUser(userId: number): void {
    const userData = this.signUpForm.value;
    this.userService.updateUser(userId, userData).subscribe(
      (data) => {
        this.toastr.success('User updated successfully');
        this.router.navigate(['/registration/list']);
      },
      (error) => {
        this.toastr.error('Failed to update user');
      }
    );
  }

  editUser(userId: number): void {
    this.userService.getUserById(userId).subscribe(
      (data: any) => {
        if (data && data.data && data.data.length > 0) {
          const userData = data.data[0];
          this.signUpForm.patchValue({
            fullname: userData.fullname,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            status: userData.status
          });
        } else {
          this.toastr.error('No user data found');
        }
      },
      (error) => {
        this.toastr.error('Failed to fetch user data');
      }
    );
  }

  goBack() {
    this.router.navigate(['/registration/list']);
  }
  resetForm() {
    this.signUpForm.reset();
  }
}
