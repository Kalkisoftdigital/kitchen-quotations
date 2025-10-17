import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';
import { CustomerService } from 'src/app/services/customer-management-service/customer.service';

interface State {
  id: number;
  state_name: string;
}
interface City {
  id: number;
  city_name: string;
  state_id: number;
}
interface Reference {
  id: number;
  reference_name: string;
}
interface productService {
  id: number;
  productService_name: string;
}

@Component({
  selector: 'app-enquiry-management',
  templateUrl: './enquiry-management.component.html',
  styleUrls: ['./enquiry-management.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class EnquiryManagementComponent {
  customerForm!: FormGroup;
  loginUserId: number | null = null;
  loginUserName: string | null = null;
  myCompany: string | null = null;
  userId: number | undefined;
  minDate!: Date;
  loginUserRole: string | null = null;
  editingMode = false;
  isSendingEmail: boolean = false;
  isLoading = false;

  states: State[] = [
    { id: 1, state_name: 'Maharashtra' },
    { id: 2, state_name: 'MP' },
    { id: 3, state_name: 'J&K' }
  ];

  cities: City[] = [
    { id: 1, city_name: 'Pune', state_id: 1 },
    { id: 2, city_name: 'Mumbai', state_id: 1 },
    { id: 3, city_name: 'Nashik', state_id: 1 },
    { id: 4, city_name: 'Bhopal', state_id: 2 },
    { id: 5, city_name: 'Indore', state_id: 2 },
    { id: 6, city_name: 'Gwalior', state_id: 2 },
    { id: 7, city_name: 'Srinagar', state_id: 3 },
    { id: 8, city_name: 'Jammu', state_id: 3 }
  ];
  selectedStateId: number | undefined;

  onStateChange(): void {
    this.selectedStateId = this.customerForm.get('select_state')?.value;
    this.customerForm.get('select_city')?.setValue(null); // Reset selected city
  }
  getCities(): City[] {
    return this.cities.filter((city) => city.state_id === this.selectedStateId);
  }

  references: Reference[] = [
    { id: 1, reference_name: 'Social Media' },
    { id: 2, reference_name: 'Portal' },
    { id: 3, reference_name: 'Personal Contact' },
    { id: 4, reference_name: 'Others' }
  ];

  productServices: productService[] = [
    { id: 1, productService_name: 'Product' },
    { id: 2, productService_name: 'Service' }
  ];

  selectCustomer: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    private userService: EnquiryManagementService,
    private customerService: CustomerService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = +params['id'];
        this.editUser(this.userId);
      }
    });
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  ngOnInit(): void {
    this.customerForm = this.formBuilder.group({
      business_name: [''],
      name: [''],
      contact_person: [''],
      contact_number: [''],
      select_state: [''],
      select_city: [''],
      address: [''],
      email: [''],
      reference: [''],
      product_service: [''],
      other_reference: [''],
      other_personal_contact: [''],
      other_portal_name: [''],
      other_personal_reference: [''],
      select_socialMedia: [''],
      gst_in: [''],

      timeline: [''],
      budget: [''],
      lead_qualification: [''],
      select_customer: ['']
    });
    // Set minimum date to today
    this.minDate = new Date();
    // Optional: Set the time to 00:00:00 to avoid any time zone issues
    this.minDate.setHours(0, 0, 0, 0);

    // Fetch sessionStorageData data
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.loginUserId = user?.user?.id || null;
    this.loginUserName = user?.user?.fullname || null;

    this.sessionData();
    // Fetch data and populate selectCustomer

    this.loginUserId = user?.user?.id || null;

    const loginCompany = user?.user?.select_company || null;

    if (loginCompany) {
      this.customerService.getCustomersByCompany(loginCompany).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.selectCustomer = response.data.map((customer: any) => ({
              id: customer.id,
              name: customer.name
            }));
          }
        },
        (error: any) => {}
      );
    }
  }

  sessionData() {
    //sessionStorageData data fetch
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.loginUserId = user.user ? user.user.id : null;
    this.loginUserRole = user.user ? user.user.role : null;
    this.myCompany = user.user ? user.user.select_company : null;
    this.loginUserName = user.user ? user.user.fullname : null;
  }
  // Function to handle the selection of a user
  onSelectCustomer(selectedCustomer: any): void {
    // Fetch the data of the selected user by ID
    this.customerService.getCustomerById(selectedCustomer.id).subscribe(
      (response: any) => {
        // Check if data is available and patch the form fields
        if (response.data && response.data.length > 0) {
          const customerData = response.data[0]; // Get the first item from the array
          this.customerForm.patchValue({
            select_customer: selectedCustomer,
            business_name: customerData.business_name,
            name: customerData.name,
            contact_person: customerData.contact_person,
            contact_number: customerData.contact_number,
            select_state: customerData.state, // Patch select_state with its ID
            select_city: customerData.city, // Patch select_city with its ID
            address: customerData.address,
            email: customerData.email,
            gst_in: customerData.gst_in
            // Patch other form fields similarly
          });
        } else {
        }
      },
      (error: any) => {}
    );
  }

  ngAfterViewInit() {}

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.isSendingEmail = true;
      this.isLoading = true;
      // Check if userId is available, if available, update existing user data
      if (this.userId) {
        this.updateUser(this.userId);
      } else {
        // If userId is not available, create a new user
        this.createUser();
      }
    } else {
      this.toastr.error('Form is invalid!');
    }
  }

  createUser(): void {
    const userData = this.customerForm.value;
    userData.loginenq_id = this.loginUserId;
    userData.loginUserName = this.loginUserName;
    userData.login_company = this.myCompany;
    userData.role = this.loginUserRole;
    // Add new customer data
    if (!userData.lead_qualification) {
      userData.lead_qualification = null; // Set it to null instead of empty string
    }
  
    if (!userData.select_socialMedia) {
      userData.select_socialMedia = null; // Set it to null instead of empty string
    }
    if (userData.reference === '') {
      userData.reference = null; // Set to null to avoid data truncation error
    }
    // Check if contact_number is empty and set it to null if so
    if (userData.contact_number === '') {
      userData.contact_number = null; // Ensure null value is inserted for empty contact_number
    }
    const selectedCustomerString = JSON.stringify(userData.select_customer);
    // Create a new object with the stringified select_customer
    const formData = {
      ...userData,
      select_customer: selectedCustomerString
    };
    this.userService.createEnquiry(formData).subscribe(
      (response: any) => {
        this.toastr.success('Enquiry created successfully!');

        this.router.navigate(['/enquiry/list']);
        this.isSendingEmail = false;
        this.isLoading = false;
      },
      (error: any) => {
        this.toastr.error('Error creating Enquiry!');
        this.isSendingEmail = false;
        this.isLoading = false;
      }
    );
  }
  updateUser(userId: number): void {
    const userData = this.customerForm.value;
    userData.loginenq_id = this.loginUserId;
    userData.loginUserName = this.loginUserName;
    userData.login_company = this.myCompany;
   // Add new customer data
   if (!userData.lead_qualification) {
    userData.lead_qualification = null; // Set it to null instead of empty string
  }
  if (userData.reference === '') {
    userData.reference = null; // Set to null to avoid data truncation error
  }
  if (!userData.select_socialMedia) {
    userData.select_socialMedia = null; // Set it to null instead of empty string
  }
  // Check if contact_number is empty and set it to null if so
  if (userData.contact_number === '') {
    userData.contact_number = null; // Ensure null value is inserted for empty contact_number
  }
    // Check if select_customer is defined before parsing it
    let selectCustomer;
    if (userData.select_customer) {
      selectCustomer = JSON.parse(userData.select_customer);
    }

    const formData = {
      ...userData,
      select_customer: selectCustomer
    };
    this.userService.updateEnquiry(userId, formData).subscribe(
      (data) => {
        this.toastr.success('Enquiry updated successfully');
        this.router.navigate(['/enquiry/list']);
        this.isSendingEmail = false;
      },
      (error) => {
        this.toastr.error('Failed to update Enquiry');
        this.isSendingEmail = false;
      }
    );
  }

  compareCustomers(customer1: any, customer2: any): boolean {
    return customer1 && customer2 ? customer1.id === customer2.id : customer1 === customer2;
  }

  editUser(userId: number): void {
    this.userService.getEnquiryById(userId).subscribe(
      (data: any) => {
        if (data && data.data) {
          const userData = data.data;
          const selectCustomer = JSON.parse(userData.select_customer);

          this.customerForm.patchValue({
            select_customer: selectCustomer,
            business_name: userData.business_name,
            name: userData.name,
            contact_person: userData.contact_person,
            contact_number: userData.contact_number,
            select_state: userData.select_state, // Patch select_state with its ID
            select_city: userData.select_city, // Patch select_city with its ID
            address: userData.address,
            email: userData.email,
            gst_in: userData.gst_in,

            reference: userData.reference,
            product_service: userData.product_service,
            other_reference: userData.other_reference,
            other_personal_contact: userData.other_personal_contact,
            other_portal_name: userData.other_portal_name,
            other_personal_reference: userData.other_personal_reference,
            select_socialMedia: userData.select_socialMedia,
            timeline: userData.timeline,
            budget: userData.budget,
            lead_qualification: userData.lead_qualification
          });
          this.editingMode = true;
          this.customerForm.get('select_customer')?.disable();
        } else {
          this.toastr.error('No Enquiry found');
        }
      },
      (error) => {
        this.toastr.error('Failed to fetch Enquiry');
      }
    );
  }

  resetForm(): void {
    this.customerForm.reset();
  }

  goBack() {
    this.router.navigate(['/enquiry/list']);
  }
  onInput(event: any): void {
    const input = event.target.value;
    event.target.value = input.replace(/[^0-9]/g, ''); // Replace any character that is not a number with an empty string
  }
}
