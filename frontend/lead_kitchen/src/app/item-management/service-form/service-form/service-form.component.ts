import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ItemManagementService } from 'src/app/services/item-management-service/item-management.service';
import { ServicesService } from 'src/app/services/service&product-service/services/services.service';

interface State {
  id: number;
  state_name: string;
}
interface Category {
  id: number;
  category_id: string;
  category_name: string;
  sub_category: string;
  description: string;
  status: string;
}
interface City {
  id: number;
  city_name: string;
}
interface Items {
  id: number;
  item_name: string;
}

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent {
  customerForm!: FormGroup;
  selectedLogo: string | ArrayBuffer | null = null;
  maintain_stock: boolean = false;
  myForm!: FormGroup;
  userId: number | undefined;
  loginUserId: number | null = null;
  myCompany: string | null = null;
  loginUserName: string | null = null;
  editingMode = false;
  selectedCategory: any;
  isSendingEmail: boolean = false; // Loading indicator variable
  isLoading = false;

  states: State[] = [
    { id: 1, state_name: 'Maharashtra' },
    { id: 2, state_name: 'MP' },
    { id: 3, state_name: 'J&K' }
  ];

  categories: Category[] = [];

  items: Items[] = [
    { id: 1, item_name: 'Maharashtra' },
    { id: 2, item_name: 'MP' }
  ];

  cities: City[] = [
    { id: 1, city_name: 'Pune' },
    { id: 2, city_name: 'Mumbai' },
    { id: 3, city_name: 'Nashik' }
  ];
  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    private itemManagementService: ItemManagementService,
    private userService: ServicesService,
    private route: ActivatedRoute, private cdr: ChangeDetectorRef
  ) { }

  closeModal(): void {
    this.modalRef.hide();
  }

  atLeastOnePriceRequired() {
  return (formGroup: FormGroup) => {
    const sellingPrice = formGroup.get('selling_price')?.value;
    const priceB = formGroup.get('priceB')?.value;

    if (!sellingPrice && !priceB) {
      formGroup.get('selling_price')?.setErrors({ required: true });
      formGroup.get('priceB')?.setErrors({ required: true });
    } else {
      // Clear errors manually if one of them is filled
      formGroup.get('selling_price')?.setErrors(null);
      formGroup.get('priceB')?.setErrors(null);
    }

    return null;
  };
}

  ngOnInit(): void {
    //common fields
this.customerForm = this.formBuilder.group({
  select_category: [''],
  select_sub_category: [''],
  shelves_count: ['0'],
selling_price: [''],
  priceB: [''],
  purchase_price: ['0'],
  al_profile: ['0'],
  multitop_profile: ['0'],
  plastic_clip: ['0'],
  valleyht_profile: ['0'],
  basic_purchase_price: ['0'],
  unit_of_measurement: [''],
  shutter_area_other: ['0'],
  companyLogo: [null, Validators.required],
  service_name: [''],
  service_desc: ['']
},
{
  validators: this.atLeastOnePriceRequired() // 👈 Add the custom validator here
});
    // Subscribe to changes in the 'select_category' field

    // Subscribe to changes in the 'basic_purchase_price' field
    this.customerForm.get('basic_purchase_price')?.valueChanges.subscribe((value: string) => {
      const basicPrice = value ? parseFloat(value) : 0;
      const updatedHsnCode = basicPrice + 2;

      // Update shelves_count based on the value of basic_purchase_price
      this.customerForm.patchValue(
        {
          shelves_count: basicPrice === 0 ? '2' : updatedHsnCode.toString()
        },
        { emitEvent: false }
      ); // Prevent circular updates
    });

    const basicPrice = parseFloat(this.customerForm.get('basic_purchase_price')?.value) || 0;
    const updatedHsnCode = basicPrice + 2;
    this.customerForm.patchValue({
      shelves_count: basicPrice === 0 ? '2' : updatedHsnCode.toString()
    });
    // Fetch user details if editing an existing service
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = +params['id'];
        this.editUser(this.userId);
      }
    });

    this.fetchCategories();

    // Subscribe to categoryAdded$ observable to fetch categories when a new category is added
    this.itemManagementService.categoryAdded$.subscribe(() => {
      this.fetchCategories();
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = +params['id'];
        this.editUser(this.userId);
      }
    });

    //sessionStorageData data fetch
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.loginUserId = user.user ? user.user.id : null;
    this.myCompany = user.user ? user.user.select_company : null;
    this.loginUserName = user.user ? user.user.fullname : null;
    this.myCompany = user.user ? user.user.select_company : null;

    this.cdr.detectChanges();
  }

  // Function to fetch and populate data when editing
  editUser(service_id: number): void {
    this.userService.getServiceById(service_id).subscribe(
      (response: any) => {
        const service = response.data.service;

        // Find the category object that matches the fetched select_category and sub_category
        this.selectedCategory = this.categories.find(
          (cat: any) => cat.category_name === service.select_category && cat.sub_category === service.select_sub_category
        );

        // Set the form with fetched service details
this.customerForm.patchValue({
  select_category: this.selectedCategory ? this.selectedCategory.category_name : service.select_category,
  select_sub_category: this.selectedCategory ? this.selectedCategory.sub_category : service.select_sub_category,
  shelves_count: service.shelves_count,
  selling_price: service.selling_price,
  priceB: service.priceB, // 👈 Add this line
  purchase_price: service.purchase_price,
  al_profile: service.al_profile,
  plastic_clip: service.plastic_clip,
  multitop_profile: service.multitop_profile,
  valleyht_profile: service.valleyht_profile,
  basic_purchase_price: service.basic_purchase_price,
  unit_of_measurement: service.unit_of_measurement,
  shutter_area_other: service.shutter_area_other,
  service_name: service.service_name,
  service_desc: service.service_desc,
  companyLogo: service.companyLogo
});
        this.editingMode = true;
        // Handle logo
        this.selectedLogo = `https://kitchen-backend-2.cloudjiffy.net/${service.companyLogo.replace('\\', '/')}`;
        if (!this.selectedLogo.includes('uploads/')) {
          this.selectedLogo = `https://kitchen-backend-2.cloudjiffy.net/uploads/${service.companyLogo.replace('\\', '/')}`;
        }
      },
      (error: any) => {
        this.toastr.error('Error fetching service details!');
      }
    ); this.cdr.detectChanges();
  }
  
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // onFileSelected(event: any): void {
  //   const file = event.target.files[0];
  //   this.customerForm.patchValue({ companyLogo: file });
  //   this.customerForm.get('companyLogo')?.updateValueAndValidity();

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.selectedLogo = reader.result;
  //   };
  //   reader.readAsDataURL(file);
  // }

  fileSizeError: boolean = false; // To track file size error

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const maxSizeInKB = 100; // Set maximum size limit to 100 KB
      const fileSizeInKB = file.size / 1024;

      if (fileSizeInKB > maxSizeInKB) {
        // this.toastr.error('File size must be less than 250 KB!');

        // Reset file input and error state
        event.target.value = null;
        this.customerForm.patchValue({ companyLogo: null });
        this.selectedLogo = null;
        this.fileSizeError = true; // Set file size error to true
        return;
      } else {
        this.fileSizeError = false; // Reset error state if file is valid
      }

      this.customerForm.patchValue({ companyLogo: file });
      this.customerForm.get('companyLogo')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedLogo = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  selectedSubCategory: string = ''; // This will store the selected sub-category

  fetchCategories(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const myCompany = user.user ? user.user.select_company : null;

    if (myCompany) {
      this.itemManagementService.getActiveCategoriesByCompany(myCompany).subscribe(
        (response: any) => {
          this.categories = response.data;
        },
        (error: any) => { }
      );
    } else {
    }
  }

  onCategoryChange(event: any): void {
    const selectedCategory = event.value; // Get the selected category object
    this.selectedCategory = selectedCategory; // Store it for pre-select
    this.customerForm.patchValue({
      select_category: selectedCategory.category_name, // Set category_name
      select_sub_category: selectedCategory.sub_category // Set sub_category
    });
  }

  createServiceDescription(): FormControl {
    return this.formBuilder.control('');
  }
  // Helper method to get the service description form array control
  get serviceDescriptionControls() {
    return this.customerForm.get('service_description') as FormArray;
  }

  // Method to add a new service description control to the form array
  addServiceDescription(event: Event) {
    event.preventDefault();
    this.serviceDescriptionControls.push(this.createServiceDescription());
  }

  // Method to remove a service description control from the form array
  removeServiceDescription(index: number) {
    this.serviceDescriptionControls.removeAt(index);
  }
  onOptionChange() {
    this.maintain_stock = !this.maintain_stock;
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      // If the form is invalid, mark all fields as touched to trigger validation messages
      this.customerForm.markAllAsTouched();
      return;
    }
    if (this.customerForm && this.customerForm.valid) {
      this.isSendingEmail = true;
      this.isLoading = true;
      const serviceData = this.customerForm.value;

      serviceData.loginSessionSer_id = this.loginUserId;
      serviceData.login_company = this.myCompany;
      serviceData.loginUserName = this.loginUserName;

      if (this.userId) {
        this.updateUser(this.userId);
      } else {
        this.createUser();
      }
    } else {
      this.customerForm.markAllAsTouched();
      this.toastr.error('Invalid Form!');
      this.isLoading = false;
    }
  }

  createUser(): void {
    const formData = this.prepareFormData();

    this.userService.createService(formData).subscribe(
      (response: any) => {
        this.toastr.success('Service created successfully!');
        this.router.navigate(['/item-management/item-list']);
        this.isSendingEmail = false;
        this.isLoading = false;
      },
      (error: any) => {
        this.toastr.error('Error creating Service!');
        this.isSendingEmail = false;
        this.isLoading = false;
      }
    );
  }

  updateUser(userId: number): void {
    const formData = this.prepareFormData();

    this.userService.updateService(userId, formData).subscribe(
      (response: any) => {
        this.toastr.success('Item updated successfully');
        this.router.navigate(['/item-management/item-list']);
        this.isSendingEmail = false;
        this.isLoading = false;
      },
      (error: any) => {
        this.toastr.error('Failed to update service');
        this.isSendingEmail = false;
        this.isLoading = false;
      }
    );
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user?.user?.id || '';

    formData.append('user_id', userId || '');
    formData.append('loginSessionSer_id', (this.loginUserId || '').toString());
    formData.append('login_company', this.myCompany || '');
    formData.append('loginUserName', this.loginUserName || '');

Object.keys(this.customerForm.controls).forEach((key) => {
  const value = this.customerForm.get(key)?.value;
  if (key === 'companyLogo') {
    if (value) {
      formData.append(key, value);
    }
  } else if (key === 'start_date' || key === 'end_date') {
    if (value) {
      formData.append(key, this.formatDate(value));
    }
  } else if (key === 'status') {
    formData.append(key, value ? 'active' : 'inactive');
  } else {
    formData.append(key, value || '');
  }
});

    return formData;
  }

  // onInput(event: any): void {
  //   const input = event.target.value;
  //   event.target.value = input.replace(/[^0-9]/g, ''); // Replace any character that is not a number with an empty string
  // }
  onInput(event: any): void {
    const input = event.target.value;

    // Allow only numbers and a single decimal point
    event.target.value = input
      .replace(/[^0-9.]/g, '') // Allow digits and decimal points
      .replace(/(\..*)\./g, '$1'); // Ensure only one decimal point
  }

  resetForm(): void {
    this.customerForm.reset();
    this.selectedCategory = null; // Clear selected category
    this.selectedLogo = null;
    this.customerForm.patchValue({ companyLogo: null });
    // Optionally reset form validation states
    this.customerForm.markAsPristine();
    this.customerForm.markAsUntouched();
    this.customerForm.updateValueAndValidity();
  }

  goBack() {
    this.router.navigate(['/item-management/item-list']);
  }
}