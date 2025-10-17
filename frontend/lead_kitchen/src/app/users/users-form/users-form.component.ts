import { Component, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/services/Login/login.service';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss']
})
export class UsersFormComponent {
  companyForm!: FormGroup;
  showPasswordMatchMessage: boolean = false;
  userId: number | undefined;
  nextQuotationId!: number;
  selectCustomer: any[] = [];
  sessionUserId: number | null = null;
  sessionUserName: string | null = null;
  showuserMessage: boolean = false;
  source: string | null = null;
  selectCompany: string | null = null;
  userRole: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,  private renderer: Renderer2,
    private userService: LoginService
  ) {
    this.fetchNextQuotationId();
  }

  fetchNextQuotationId(): void {
    this.userService.getNextUserId().subscribe(
      (data: any) => {
        const nextQuotationId = data.user_id;

        this.nextQuotationId = nextQuotationId;
      },
      (error) => {}
    );
  }
 

  closeModal(): void {
    this.modalRef.hide();
  }

  ngOnInit(): void {
    this.companyForm = this.formBuilder.group({
      employeeCode: [''],
      created_id: [''],
      select_company: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNo: ['', Validators.pattern('^[0-9]{10}$')],
      email: ['', [Validators.required, Validators.email]],
      panCard: ['', Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$')],
      aadhar: ['', Validators.pattern('^[0-9]{12}$')],
      designation: ['', Validators.required],
      address: [''],
      password: ['', Validators.required],
      confirmPassword: ['', [Validators.required, this.passwordMatchValidator]],
      role: ['', Validators.required],
      status: [false]
    });

    this.companyForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.updatePasswordMatchMessage();
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = +params['id'];
        this.editUser(this.userId);
      }
    });

    // Retrieve the navigation state to determine the source
    this.route.queryParams.subscribe((params) => {
      this.source = params['source'];
    });

    this.getCompanyDropdown();
    this.sessionData();
  }
 
  sessionData() {
    //sessionStorageData data fetch
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;

    this.sessionUserId = user.user ? user.user.id : null;
    this.sessionUserName = user.user ? user.user.fullname : null;
  
    this.userRole = user?.user?.role || null;
    this.selectCompany = user?.user?.select_company || null;
  }

  getCompanyDropdown(): void {
    this.userService.getActiveCompanies().subscribe(
      (response: any) => {
        this.selectCustomer = response.data
          .filter((customer: any) => {
            if (this.userRole === 'kalkisoft') {
              return true; // Exclude no companies for 'kalkisoft' role
            }
            return customer.companyName === this.selectCompany;
          })
          .map((customer: any) => ({
            id: customer.id,
            name: customer.companyName
          }));
      },
      (error: any) => {}
    );
  }

  editUser(userId: number): void {
    this.userService.getUserById(userId).subscribe(
      (data: any) => {
       
        if (data && data.data && data.data.length > 0) {
          const userData = data.data[0];
          this.companyForm.patchValue({
            employeeCode: userData.id,
            created_id: userData.created_id,
            select_company: userData.select_company,
            firstName: userData.firstName,
            lastName: userData.lastName,
            fullname: userData.fullname,
            phoneNo: userData.phoneNo,
            email: userData.email,
            panCard: userData.panCard,
            aadhar: userData.aadhar,
            designation: userData.designation,
            address: userData.address,
            password: userData.password,
            username: userData.username,
            confirmPassword: userData.confirmPassword,
            role: userData.role,
            status: userData.status === 'active'
          });
          this.companyForm.get('created_id')?.disable();
          //hide status field for superadmin
          const statusElement = document.getElementById('status-field');
          if (this.sessionUserName == userData.fullname && this.userRole !== 'kalkisoft' && statusElement) {
            this.companyForm.get('status')?.disable();
            this.renderer.addClass(statusElement, 'd-none');
          } else if (statusElement) {
            this.renderer.removeClass(statusElement, 'd-none');
          }
          
        } else {
          this.toastr.error('No user data found');
        }
      },
      (error) => {
        this.toastr.error('Failed to fetch user data');
      }
    );
  }
  
  // Function to update the password match message
  updatePasswordMatchMessage(): void {
    const password = this.companyForm.get('password')?.value;
    const confirmPassword = this.companyForm.get('confirmPassword')?.value;

    // Check if passwords match
    if (password === confirmPassword) {
      this.showPasswordMatchMessage = true;
      setTimeout(() => {
        this.showPasswordMatchMessage = false;
      }, 2000);
    } else {
      this.showPasswordMatchMessage = false;
    }
  }

  updateStatus(event: any): void {
    const isChecked = event.target.checked;
    const status = isChecked ? 'active' : 'inactive';
    this.companyForm.get('status')?.setValue(status);
  }

  onInput(event: any): void {
    const input = event.target.value;
    event.target.value = input.replace(/[^0-9]/g, ''); // Replace any character that is not a number with an empty string
  }

  passwordMatchValidator(control: FormControl) {
    const password = control.root.get('password');

    // Check if the passwords match
    if (password && control.value !== password.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  // onSubmit(): void {
  //   if (this.companyForm && this.companyForm.value && this.companyForm.valid) {
  //     const userData = this.prepareUserData();

  //     if (this.userId) {
  //       this.companyForm.get('password')?.enable();
  //       this.companyForm.get('confirmPassword')?.enable();
  //       this.updateUser(this.userId);
  //     } else {
  //       this.createUser();
  //     }
  //   } else {
  //     this.toastr.error('Form is invalid!');
  //   }
  // }
  onSubmit(): void {
    if (this.companyForm && this.companyForm.valid) {
      const confirmPasswordControl = this.companyForm.get('confirmPassword') as FormControl;

      if (this.passwordMatchValidator(confirmPasswordControl)) {
        this.toastr.error('Passwords do not match!');
        return;
      }

      const userData = this.prepareUserData();

      if (this.userId) {
        this.companyForm.get('password')?.enable();
        this.companyForm.get('confirmPassword')?.enable();
        this.updateUser(this.userId);
      } else {
        this.createUser();
      }
    } else {
      this.toastr.error('Form is invalid!');
    }
  }

  createUser(): void {
    const userData = this.prepareUserData();
    userData.sessionUser_id = this.sessionUserId;
    userData.sessionUser_name = this.sessionUserName;

    this.userService.createUser(userData).subscribe(
      (response: any) => {
        this.toastr.success('User created successfully!');

        this.router.navigate(['/users/user-list']);
      },
      (error: any) => {
        if (error && error.error && error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Error creating user!');
        }
        
      }
    );
  }

  updateUser(userId: number): void {
    const userData = this.prepareUserData();
  
    // Fetch current user details to determine current status (if needed for other fields)
    this.userService.getUserById(userId).subscribe(
      (userDetails) => {
        if (userDetails) {
          // Only include status in userData if it's different from the current status
          if (userData.status !== (userDetails.status === 'active' ? 'active' : 'inactive')) {
            userData.status = userDetails.status === 'active' ? 'inactive' : 'active';
          } else {
            delete userData.status; // Remove status if it's the same as current status
          }
  
          // Update user with userData
          this.userService.updateUser(userId, userData).subscribe(
            (data) => {
              this.toastr.success('User updated successfully');
              this.router.navigate(['/users/user-list']);
            },
            (error) => {
              this.toastr.error('Failed to update user');
            }
          );
        } else {
          this.toastr.error('User details not found');
        }
      },
      (error) => {
        this.toastr.error('Failed to fetch user details');
      }
    );
  }
  
  prepareUserData(): any {
    const userData = { ...this.companyForm.value };
    

    if (this.companyForm.get('status')?.disabled) {
      userData.status = 'active';
    } else {
      // Adjust status based on form value
      userData.status = userData.status ? 'active' : 'inactive';
    }
    return userData;
  }

  resetForm(): void {
    this.companyForm.reset();
  }

  
  goBack() {
    if (this.source === 'table') {
      this.router.navigate(['/analytics']);
    } else {
      // Default behavior if the source is unknown
      this.router.navigate(['/users/user-list']); // Change this to the default route if necessary
    }
  }
}
