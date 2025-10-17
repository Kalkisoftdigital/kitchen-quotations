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
import { ItemTableService } from 'src/app/services/item-table-service/item-table.service';
@Component({
  selector: 'app-quotation-dialog',
  templateUrl: './quotation-dialog.component.html',
  styleUrls: ['./quotation-dialog.component.scss']
})
export class QuotationDialogComponent {
  customerForm!: FormGroup;
  stateId: number | undefined;
  selectCustomer: any[] = [];
  selectedItemType: string = 'Cabinet';

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<QuotationDialogComponent>,
    private stateService: StatesCitiesService,
    private productService: ItemTableService,
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

  closeModal(): void {
    this.modalRef.hide();
  }
  ngOnInit(): void {
    this.initializeForm();
    this.fetchProduct();
    this.onItemTypeChange({ value: this.selectedItemType });
  }

  initializeForm() {
    this.customerForm = this.formBuilder.group({
      item_type: [this.selectedItemType, Validators.required],
      cabinet_type: [''],
      Shutter_profile: [''],
      other_type: [''],
      select_item: [''],
      select_item_backPanel: [''],
      quantity: [''],
      length: [''],
      width: [''],
      height: [''],
      total: [''],
      wantBack: [false]
    });
  }
  onCheckboxChange(event: any): void {
    const isChecked = event.target.checked;
    
    // Update the form control for 'wantBack'
    this.customerForm.get('wantBack')?.setValue(isChecked);
  
    // Perform additional actions based on the checkbox state
    if (isChecked) {
      // Actions when the checkbox is checked
      // For example, you might want to set default values or perform certain operations
      this.customerForm.get('select_item_backPanel')?.enable(); // Enable the field if necessary
    } else {
      // Actions when the checkbox is unchecked
      // For example, you might want to clear or disable fields
      this.customerForm.get('select_item_backPanel')?.disable(); // Disable the field if necessary
      this.customerForm.get('select_item_backPanel')?.reset(); // Clear the value
    }
  }
  
  onItemTypeChange(event: any): void {
    this.selectedItemType = event.value;

    // Update the form control with the selected item type
    this.customerForm.get('item_type')?.setValue(this.selectedItemType);

    // Clear cabinet_type and Shutter_profile if they are not relevant
    if (this.selectedItemType !== 'Cabinet') {
      this.customerForm.get('cabinet_type')?.reset();
    }
    if (this.selectedItemType !== 'Shutter') {
      this.customerForm.get('Shutter_profile')?.reset();
    }
    if (this.selectedItemType !== 'OtherItem') {
      this.customerForm.get('other_type')?.reset();
    }
  }

  fetchProduct() {
    this.productService.getItemsDropdown().subscribe(
      (data) => {
        console.log(data)
        this.selectCustomer = data;
      },
      (error) => {}
    );
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

  onSelectCustomer(selectedCustomer: any): void {}

  compareCustomers(customer1: any, customer2: any): boolean {
    return customer1 && customer2 ? customer1.id === customer2.id : customer1 === customer2;
  }

  resetForm(): void {
    this.customerForm.reset();
  }

  goBack() {
    this.router.navigate(['/item-management/category-list']);
  }
}
