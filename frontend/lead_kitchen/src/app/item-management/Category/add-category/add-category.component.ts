import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { ItemManagementService } from 'src/app/services/item-management-service/item-management.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent {
  customerForm!: FormGroup;
  categoryId: number | undefined;
  loginUserId: number | null = null;
  isActive: boolean = false;
  myCompany: string | null = null;
  loginUserName: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    public userService: ItemManagementService,
    @Inject(MAT_DIALOG_DATA) public data: { categoryId: number }
  ) {
    if (data && data.categoryId) {
      // Fetch category data by ID and auto-fill the form
      this.userService.getCategoryById(data.categoryId).subscribe(
        (category: any) => {
          this.customerForm.patchValue({
            category_name: category.data.category_name,
            sub_category: category.data.sub_category,
            description: category.data.description,
            loginUserName: category.data.category_name,
            status: category.data.status === 'active'
          });
        },
        (error: any) => {}
      );
    }
  }

  toggleActive() {
    this.isActive = !this.isActive;
  }
  toggleStatus(): void {
    this.isActive = !this.isActive;
    // Set status in the form based on isActive value
    this.customerForm.get('status')?.setValue(this.isActive ? 'Active' : 'Inactive');
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  ngOnInit(): void {
    this.customerForm = this.formBuilder.group({
      category_name: ['', Validators.required],
      sub_category: ['', Validators.required],
      description: ['', Validators.required],
      status: [false]
    });

    //sessionStorageData data fetch
    this.sessionStorageData();
  }

  sessionStorageData() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.loginUserId = user.user ? user.user.id : null;
    this.myCompany = user.user ? user.user.select_company : null;
    this.loginUserName = user.user ? user.user.fullname : null;
  }

  updateStatus(event: any): void {
    const isChecked = event.target.checked;
    const status = isChecked ? 'active' : 'inactive';
    this.customerForm.get('status')?.setValue(status);
  }

  onSubmit(): void {
    if (this.customerForm && this.customerForm.valid && this.customerForm.value) {
      // If categoryId is provided, update existing data
      if (this.data && this.data.categoryId) {
        this.updateCategory(this.data.categoryId);
      } else {
        // If categoryId is not provided, create new data
        this.createUser();
      }
    } else {
      this.toastr.error('Form is invalid!');
    }
  }

  createUser(): void {
    const userData = this.prepareUserData();
    const categoryData = this.customerForm.value;
    userData.status = categoryData.status ? 'active' : 'inactive';
    userData.sessionLogCat_id = this.loginUserId;
    userData.login_company = this.myCompany;
    userData.loginUserName = this.loginUserName;
    this.userService.createCategory(userData).subscribe(
      (response: any) => {
        this.toastr.success('Category created successfully!');
        this.router.navigate(['/item-management/category-list']);
        this.dialogRef.close();
      },
      (error: any) => {
        this.toastr.error('Error creating category!');
      }
    );
  }

  updateCategory(categoryId: number): void {
    const userData = this.prepareUserData(); // Prepare userData with loginUserName included

    this.userService.updateCategory(categoryId, userData).subscribe(
      (response: any) => {
        this.toastr.success('Category updated successfully!');
        this.router.navigate(['/item-management/category-list']);
        this.dialogRef.close();
      },
      (error: any) => {
        this.toastr.error('Failed to update category');
      }
    );
  }
  prepareUserData(): any {
    const userData = { ...this.customerForm.value };
    userData.status = userData.status ? 'active' : 'inactive';
    userData.sessionLogCat_id = this.loginUserId;
    userData.login_company = this.myCompany;
    userData.loginUserName = this.loginUserName;
    return userData;
  }

  resetForm(): void {
    this.customerForm.reset();
  }

  goBack() {
    this.router.navigate(['/item-management/category-list']);
  }
}
