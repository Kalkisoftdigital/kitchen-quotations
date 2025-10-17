import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
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

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {
  customerForm!: FormGroup;

  states: State[] = [
    { id: 1, state_name: 'Andhra Pradesh' },
    { id: 2, state_name: 'Arunachal Pradesh' },
    { id: 3, state_name: 'Assam' },
    { id: 4, state_name: 'Bihar' },
    { id: 5, state_name: 'Chhattisgarh' },
    { id: 6, state_name: 'Goa' },
    { id: 7, state_name: 'Gujarat' },
    { id: 8, state_name: 'Haryana' },
    { id: 9, state_name: 'Himachal Pradesh' },
    { id: 10, state_name: 'Jharkhand' },
    { id: 11, state_name: 'Karnataka' },
    { id: 12, state_name: 'Kerala' },
    { id: 13, state_name: 'Madhya Pradesh' },
    { id: 14, state_name: 'Maharashtra' },
    { id: 15, state_name: 'Manipur' },
    { id: 16, state_name: 'Meghalaya' },
    { id: 17, state_name: 'Mizoram' },
    { id: 18, state_name: 'Nagaland' },
    { id: 19, state_name: 'Odisha' },
    { id: 20, state_name: 'Punjab' },
    { id: 21, state_name: 'Rajasthan' },
    { id: 22, state_name: 'Sikkim' },
    { id: 23, state_name: 'Tamil Nadu' },
    { id: 24, state_name: 'Telangana' },
    { id: 25, state_name: 'Tripura' },
    { id: 26, state_name: 'Uttar Pradesh' },
    { id: 27, state_name: 'Uttarakhand' },
    { id: 28, state_name: 'West Bengal' },
    { id: 29, state_name: 'Andaman and Nicobar Islands' },
    { id: 30, state_name: 'Chandigarh' },
    { id: 31, state_name: 'Dadra and Nagar Haveli and Daman and Diu' },
    { id: 32, state_name: 'Delhi' },
    { id: 33, state_name: 'Lakshadweep' },
    { id: 34, state_name: 'Puducherry' },
    { id: 35, state_name: 'Jammu and Kashmir' },
    { id: 36, state_name: 'Ladakh' }
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
  onStateChange(): void {
    this.selectedStateId = this.customerForm.get('state')?.value;
    this.customerForm.get('city')?.setValue(null); // Reset selected city
  }
  getCities(): City[] {
    return this.cities.filter((city) => city.state_id === this.selectedStateId);
  }
  selectedStateId: number | undefined;
  userId: number | undefined;
  loginUserId: number | null = null;
  superAdminId: number | null = null;
  myCompany: string | null = null;
  loginUserName: string | null = null;
  loginUserRole: string | null = null;
  personDescriptions!: FormArray;
  editingMode: boolean = false;
  isSendingEmail: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private customerService: CustomerService
  ) {
    this.customerForm = this.formBuilder.group({
      name: ['', Validators.required],
      owner_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', Validators.email],
      contact_number: ['', Validators.pattern('^[0-9]{10}$')],
      business_name: [''],

      contact_person: [''],
      state: [''],
      city: [''],
      address: ['', Validators.required],
      pincode: ['', Validators.pattern('^[0-9]{6}$')],
      gst_in: [''],
      landline_no: ['', Validators.pattern('^[0-9]{10}$')],
      person_description: this.formBuilder.array([])
    });
  }

  closeModal(): void {
    this.modalRef.hide();
  }
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = +params['id']; // Convert userId to number
        this.editCustomer(); // Populate form with user data for editing
      }
    });
    this.sessionData();
  }
  // --------------------form array contact person------------
  // Updated method to create a FormGroup with both contact_person2 and contact_number2
  createServiceDescription(): FormGroup {
    return this.formBuilder.group({
      contact_person2: [''],
      contact_number2: ['']
    });
  }

  // Helper method to get the service description form array control
  get serviceDescriptionControls() {
    return this.customerForm.get('person_description') as FormArray;
  }

  // Method to add a new service description control to the form array
  addServiceDescription(event: Event) {
    event.preventDefault(); // Prevent form submission
    const personDescriptionArray = this.customerForm.get('person_description') as FormArray;
    personDescriptionArray.push(this.createServiceDescription());
  }

  // Method to remove a service description control from the form array
  removeServiceDescription(index: number) {
    this.serviceDescriptionControls.removeAt(index);
  }
  // --------------------form array contact person------------
  sessionData() {
    //sessionStorageData data fetch
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.loginUserId = user.user ? user.user.id : null;
    this.superAdminId = user.user ? user.user.sessionUser_id : null;
    this.myCompany = user.user ? user.user.select_company : null;
    this.loginUserName = user.user ? user.user.fullname : null;
    this.loginUserRole = user.user ? user.user.role : null;
  }

  onInput(event: any): void {
    const input = event.target.value;
    event.target.value = input.replace(/[^0-9]/g, ''); // Replace any character that is not a number with an empty string
  }

  onSubmit(): void {
    if (this.customerForm.valid) {    this.isSendingEmail = true; 
      const formData = this.customerForm.value;
      formData.login_id = this.loginUserId;
      formData.superadmin_id = this.superAdminId;
      formData.login_company = this.myCompany;
      formData.loginUserName = this.loginUserName;
      formData.role = this.loginUserRole;
      // Filter out empty entries from person_description
      formData.person_description = formData.person_description.filter(
        (desc: any) => desc.contact_person2.trim() !== '' || desc.contact_number2.trim() !== ''
      );
      if (this.userId) {
        // Update existing user data
        this.customerService.updateCustomer(this.userId, formData).subscribe(
          (data) => {
            this.toastr.success('Customer updated successfully');
            this.router.navigate(['/customers/list']);
            this.isSendingEmail = false;
          },
          (error) => {
            this.toastr.error(error);
            this.isSendingEmail = false;
          }
        );
      } else {
        // Add new customer data
        const selectedStateId = formData.state;
        const selectedState = this.states.find((state) => state.id === selectedStateId);
        const stateName = selectedState ? selectedState.state_name : '';

        // Fetch city name
        const selectedCityId = formData.city;
        const selectedCity = this.cities.find((city) => city.id === selectedCityId);
        const cityName = selectedCity ? selectedCity.city_name : '';

        const customerData = {
          ...formData

          // state: stateName,
          // city: cityName
        };
        customerData.login_id = this.loginUserId;
        customerData.superadmin_id = this.superAdminId;
        customerData.login_company = this.myCompany;
        customerData.loginUserName = this.loginUserName;
        customerData.role = this.loginUserRole;
        // Send the form data to the backend
        this.customerService.createCustomer(customerData).subscribe(
          (data) => {
            this.toastr.success('Customer added successfully');
            this.customerForm.reset(); // Reset the form after successful submission
            this.router.navigate(['/customers/list']);
            this.isSendingEmail = false;
          },
          (error) => {
            this.toastr.error(error);
            this.isSendingEmail = false;
          }
        );
      }
    } else {
      this.toastr.error('Form is invalid!');
    }
  }

  editCustomer(): void {
    if (this.userId) {
      this.customerService.getCustomerByIds(this.userId).subscribe(
        (data: any) => {
          if (data && data.data) {
            const userData = data.data.user;
            const personDescriptions = data.data.person_descriptions;

            // Patch user values into the form
            this.customerForm.patchValue({
              name: userData.name,
              owner_mobile: userData.owner_mobile,
              email: userData.email,
              contact_number: userData.contact_number,
              business_name: userData.business_name,
              contact_person: userData.contact_person,
              address: userData.address,
              pincode: userData.pincode,
              gst_in: userData.gst_in,
              landline_no: userData.landline_no,
              city: userData.city,
              state: userData.state
            });
            this.editingMode = true;
            // Handle person descriptions
            if (personDescriptions && personDescriptions.length > 0) {
              // Clear existing descriptions
              const personDescriptionArray = this.customerForm.get('person_description') as FormArray;
              personDescriptionArray.clear();

              // Add each description to the FormArray
              personDescriptions.forEach((desc: any) => {
                personDescriptionArray.push(
                  this.formBuilder.group({
                    contact_person2: [desc.contact_person2 || ''],
                    contact_number2: [desc.contact_number2 || '']
                  })
                );
              });
            } else {
              // Ensure the FormArray is empty if no descriptions
              this.customerForm.setControl('person_description', this.formBuilder.array([]));
            }
          } else {
            this.toastr.error('No customer data found');
          }
        },
        (error) => {
          this.toastr.error('Failed to fetch customer data');
        }
      );
    } else {
      this.toastr.error('No userId provided');
    }
  }

  // Helper function to get state ID by name
  getStateIdByName(stateName: string): number | undefined {
    const state = this.states.find((state) => state.state_name === stateName);
    return state ? state.id : undefined;
  }

  // Helper function to get city ID by name
  getCityIdByName(cityName: string): number | undefined {
    const formattedCityName = cityName.trim().toLowerCase();
    const city = this.cities.find((city) => city.city_name.trim().toLowerCase() === formattedCityName);
    return city ? city.id : undefined;
  }

  resetForm(): void {
    this.customerForm.reset();
  }

  goBack() {
    this.router.navigate(['/customers/list']);
  }
}
