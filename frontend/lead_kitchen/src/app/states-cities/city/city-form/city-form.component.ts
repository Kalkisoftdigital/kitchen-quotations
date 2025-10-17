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
interface State {
  id: number;
  state_id: number;
  state_name: string;
  status: string;
}

@Component({
  selector: 'app-city-form',
  templateUrl: './city-form.component.html',
  styleUrls: ['./city-form.component.scss']
})
export class CityFormComponent {
  customerForm!: FormGroup;
  cityId: number | undefined;
  states: State[] = [];
  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<CityFormComponent>,
    public userService: StatesCitiesService,
    @Inject(MAT_DIALOG_DATA) public data: { cityId: number }
  ) {
    if (data && data.cityId) {
      // Fetch category data by ID and auto-fill the form
      this.userService.getCityById(data.cityId).subscribe(
        (category: any) => {
          this.customerForm.patchValue({
            state_name: category.data.state_name,
            state_id: category.data.state_id,
            city_name: category.data.city_name,
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
    this.customerForm.get('status')?.setValue(this.isActive ? 'Active' : 'Inactive');
  }
  closeModal(): void {
    this.modalRef.hide();
  }
  ngOnInit(): void {
    this.customerForm = this.formBuilder.group({
      // state_id: ['', Validators.required],
      state_name: ['', Validators.required],
      city_name: ['', Validators.required],
      status: [false]
    });
    this.fetchCategories();
  }
  fetchCategories(): void {
    this.userService.getAllStates().subscribe(
      (response: any) => {
        if (response && Array.isArray(response.data)) {
          // Assign the data array directly to the states variable
          this.states = response.data;
        } else {
          // Handle invalid response format
        }
      },
      (error) => {
        // Handle error
      }
    );
  }

  onSubmit(): void {
    if (this.customerForm && this.customerForm.valid && this.customerForm.value) {
      // If cityId is provided, update existing data
      if (this.data && this.data.cityId) {
        this.updateCategory(this.data.cityId);
      } else {
        // If cityId is not provided, create new data
        this.createUser();
      }
    } else {
      this.toastr.error('Form is invalid!');
    }
  }

  createUser(): void {
    const categoryData = this.customerForm.value;
    this.userService.createCity(categoryData).subscribe(
      (response: any) => {
        this.toastr.success('User created successfully!');

        this.toastr.success('Category submitted successfully!');
        this.router.navigate(['/city-list']);
        this.dialogRef.close();
      },
      (error: any) => {
        this.toastr.error('Error creating category!');
      }
    );
  }

  updateCategory(cityId: number): void {
    const categoryData = this.customerForm.value;
    this.userService.updateCity(cityId, categoryData).subscribe(
      (data) => {
        this.toastr.success('category updated successfully');
        this.router.navigate(['/city-list']);
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
    this.router.navigate(['/city-list']);
  }
}
