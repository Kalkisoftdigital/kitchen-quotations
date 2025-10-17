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

import { StatesCitiesService } from 'src/app/services/state-city/state-city.service';

@Component({
  selector: 'app-state-form',
  templateUrl: './state-form.component.html',
  styleUrls: ['./state-form.component.scss']
})
export class StateFormComponent {
  customerForm!: FormGroup;
  stateId: number | undefined;

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<StateFormComponent>,
    private stateService: StatesCitiesService,
    @Inject(MAT_DIALOG_DATA) public data: { stateId: number }
  ) {
    if (data && data.stateId) {
      // Fetch category data by ID and auto-fill the form
      this.stateService.getStateById(data.stateId).subscribe(
        (category: any) => {
          this.customerForm.patchValue({
            state_name: category.data.state_name,
            status: category.data.status
          });
        },
        (error: any) => {}
      );
    }
  }

  isActive: boolean = false;

  toggleActive() {
    this.isActive = !this.isActive;
  }
  toggleStatus(): void {
    this.isActive = !this.isActive;
    // Set status in the form based on isActive value
    this.customerForm.get('status')?.setValue(this.isActive ? 'active' : 'inactive');
  }
  closeModal(): void {
    this.modalRef.hide();
  }
  ngOnInit(): void {
    this.customerForm = this.formBuilder.group({
      state_name: ['', Validators.required],

      status: ['active']
    });
  }

  onSubmit(): void {
    if (this.customerForm && this.customerForm.valid && this.customerForm.value) {
      // If stateId is provided, update existing data
      if (this.data && this.data.stateId) {
        this.updateCategory(this.data.stateId);
      } else {
        // If stateId is not provided, create new data
        this.createUser();
      }
    } else {
      this.toastr.error('Form is invalid!');
    }
  }

  createUser(): void {
    const categoryData = this.customerForm.value;
    this.stateService.createState(categoryData).subscribe(
      (response: any) => {
        this.toastr.success('State created successfully!');

   
        this.router.navigate(['/state-list']);
        this.dialogRef.close();
      },
      (error: any) => {
        this.toastr.error('Error creating category!');
      }
    );
  }

  updateCategory(stateId: number): void {
    const categoryData = this.customerForm.value;
    this.stateService.updateState(stateId, categoryData).subscribe(
      (data) => {
        this.toastr.success('category updated successfully');
        this.router.navigate(['/state-list']);
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

  goBack() {
    this.router.navigate(['/item-management/category-list']);
  }
}
