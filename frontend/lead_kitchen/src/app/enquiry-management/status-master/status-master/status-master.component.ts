import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';

@Component({
  selector: 'app-status-master',
  templateUrl: './status-master.component.html',
  styleUrls: ['./status-master.component.scss']
})
export class StatusMasterComponent implements OnInit {
  customerForm!: FormGroup;
  userId: number | undefined;
  sessionUserId: number | null = null;
  sessionUserName: string | null = null;
  sessionUserRole: string | null = null;
  userRole: string | null = null;
  selectCompany: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    private enquiryService: EnquiryManagementService,
    public dialogRef: MatDialogRef<StatusMasterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number }
  ) {
    if (data && data.userId) {
      // Fetch category data by ID and auto-fill the form
      this.enquiryService.getEnquiriesMasterById(data.userId).subscribe(
        (category: any) => {
     
          this.customerForm.patchValue({
            status_name: category.data[0].status_name,
            SessionMaster_id: category.data[0].SessionMaster_id
          });
          // Set status checkbox based on fetched data
          this.customerForm.get('status')?.setValue(category.data[0].status === 'active'); // Set checkbox based on status
        },
        (error: any) => {}
      );
    }
  }

  ngOnInit(): void {
    this.customerForm = this.formBuilder.group({
      status_name: ['', Validators.required],
      status: [false],
      SessionMaster_id: ['']
    });

    this.sessionData();
  }

  sessionData() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.sessionUserId = user?.user?.id ?? null;

    this.sessionUserName = user?.user?.fullname ?? null;
    this.sessionUserRole = user?.user?.role ?? null;
    this.selectCompany = user?.user?.select_company ?? null;
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  onSubmit(): void {
    
    if (this.customerForm && this.customerForm.valid && this.customerForm.value) {
      // If userId is provided, update existing data
      if (this.data && this.data.userId) {
        this.updateCategory(this.data.userId);
      } else {
        // If userId is not provided, create new data
        this.createUser();
      }
    } else {
      this.toastr.error('Form is invalid!');
    }
  }

  createUser(): void {
    const categoryData = this.customerForm.value;
    categoryData.status = this.customerForm.get('status')?.value ? 'active' : 'inactive';
    categoryData.SessionMaster_id = this.sessionUserId;
    categoryData.login_company = this.selectCompany;
    categoryData.role = this.sessionUserRole;
   
    this.enquiryService.createEnquiriesMaster(categoryData).subscribe(
      (response: any) => {
        this.toastr.success('EnquiriesMaster submitted successfully!');
        this.router.navigate(['/enquiry/status-list']);
        this.enquiryService.notifyCategoryAdded();
        this.dialogRef.close();
      },
      (error: any) => {
        this.toastr.error('Error creating category!');
      }
    );
  }

  updateCategory(userId: number): void {
    const categoryData = this.customerForm.value;
    categoryData.status = this.customerForm.get('status')?.value ? 'active' : 'inactive';
    categoryData.SessionMaster_id = this.sessionUserId;
    
    this.enquiryService.updateEnquiriesMaster(userId, categoryData).subscribe(
      (data) => {
        this.toastr.success('EnquiriesMaster updated successfully');
        this.router.navigate(['/enquiry/status-list']);
        this.enquiryService.notifyCategoryAdded();
        this.dialogRef.close();
      },
      (error) => {
        this.toastr.error('Failed to update category');
      }
    );
  }
  resetForm(): void {
    this.customerForm.reset();
  }

  goBack(): void {
    this.router.navigate(['/enquiry/status-list']);
  }

  updateStatus(event: any): void {
    const isChecked = event.target.checked;
    const status = isChecked ? 'active' : 'inactive';
    this.customerForm.get('status')?.setValue(isChecked);
  }
}
