import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/services/company-service/company.service';

// interface State {
//   id: number;
//   state_name: string;
// }
interface City {
  id: number;
  city_name: string;
}

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent {
  companyForm!: FormGroup;
  userId: number | undefined;
  selectedUserRole: string | null = null;
  selectedLogo: string | ArrayBuffer | null = null;
  minDate!: Date;

  countries: string[] = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Democratic Republic of the Congo',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'East Timor',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Ivory Coast',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kosovo',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Korea',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Korea',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe'
  ];

  cities: City[] = [
    { id: 1, city_name: 'Maharashtra' },
    { id: 2, city_name: 'MP' },
    { id: 3, city_name: 'J&K' }
  ];
  states: string[] = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Lakshadweep',
    'Puducherry'
  ];

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private userService: CompanyService
  ) {}

  closeModal(): void {
    this.modalRef.hide();
  }
  ngOnInit(): void {
    this.companyForm = this.formBuilder.group({
      country: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{5}$')]],
      users_allowed: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      companyName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      landline: ['', Validators.pattern('^[0-9]{10}$')],
      companyLandline: ['', Validators.pattern('^[0-9]{10}$')],
      companyType: [''],
      accountNo: [''],
      companyLogo: [null],
      companyAddress: [''],
      lastName: [''],
      phoneNo: ['', Validators.pattern('^[0-9]{10}$')],
      companyPhoneNo: ['', Validators.pattern('^[0-9]{10}$')],
      gstIN: [''],
      bankDetails: [''],
      ifscCode: [''],
      status: [false]
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.userId = +params['id'];
        this.editUser(this.userId);
      }
    });
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.selectedUserRole = user && user.user ? user.user.role : null;

    this.minDate = new Date();
    // Optional: Set the time to 00:00:00 to avoid any time zone issues
    this.minDate.setHours(0, 0, 0, 0);
  }

  onInput(event: any): void {
    const input = event.target.value;
    event.target.value = input.replace(/[^0-9]/g, ''); // Replace any character that is not a number with an empty string
  }

  updateStatus(event: any): void {
    const isChecked = event.target.checked;
    const status = isChecked ? 'active' : 'inactive';
    this.companyForm.get('status')?.setValue(status);
  }

  onSubmit(): void {
    if (this.companyForm && this.companyForm.value && this.companyForm.valid) {
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
    const userData = this.prepareFormData();

    this.userService.createCompany(userData).subscribe(
      () => {
        this.toastr.success('Company submitted successfully!');
        this.router.navigate(['/company/company-list']);
      },
      (error) => {
        this.toastr.error('Error creating company!');
      }
    );
  }

  updateUser(userId: number): void {
    const userData = this.prepareFormData();

    this.userService.updateCompany(userId, userData).subscribe(
      () => {
        this.toastr.success('Company updated successfully');
        this.router.navigate(['/company/company-list']);
      },
      (error) => {
        this.toastr.error('Failed to update company');
      }
    );
  }

  editUser(userId: number): void {
    this.userService.getCompanyById(userId).subscribe(
      (data: any) => {
        const userData = data.company;
        this.companyForm.patchValue({
          country: userData.country,
          city: userData.city,
          state: userData.state,
          district: userData.district,
          pincode: userData.pincode,
          users_allowed: userData.users_allowed,
          start_date: userData.start_date ? new Date(userData.start_date) : '',
          end_date: userData.end_date ? new Date(userData.end_date) : '',
          companyName: userData.companyName,
          firstName: userData.firstName,
          email: userData.email,
          landline: userData.landline,
          companyLandline: userData.companyLandline,
          companyType: userData.companyType,
          accountNo: userData.accountNo,
          companyAddress: userData.companyAddress,
          lastName: userData.lastName,
          phoneNo: userData.phoneNo,
          companyPhoneNo: userData.companyPhoneNo,
          gstIN: userData.gstIN,
          bankDetails: userData.bankDetails,
          ifscCode: userData.ifscCode,
          status: userData.status === 'active',
          companyLogo: userData.companyLogo
        });
        this.selectedLogo = `https://kitchen-backend-2.cloudjiffy.net/${userData.companyLogo.replace('\\', '/')}`;

        // Check if the URL needs the 'uploads/' prefix
        if (!this.selectedLogo.includes('uploads/')) {
          this.selectedLogo = `https://kitchen-backend-2.cloudjiffy.net/uploads/${userData.companyLogo.replace('\\', '/')}`;
        }
      },
      (error) => {
        this.toastr.error('Failed to fetch user data');
      }
    );
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user && user.user ? user.user.id : null;

    formData.append('user_id', userId);

    Object.keys(this.companyForm.controls).forEach((key) => {
      if (key === 'companyLogo') {
        const file = this.companyForm.get(key)?.value;
        if (file) {
          formData.append(key, file);
        }
      } else if (key === 'start_date' || key === 'end_date') {
        const dateValue = this.companyForm.get(key)?.value;
        if (dateValue) {
          // Ensure the value is a valid Date object before formatting
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            formData.append(key, this.formatDate(date));
          } else {
            // Handle invalid date input if necessary
            console.error("Invalid date:", dateValue);
          }
        }
        
      } else if (key === 'status') {
        const statusValue = this.companyForm.get(key)?.value ? 'active' : 'inactive';
        formData.append(key, statusValue);
      } else {
        formData.append(key, this.companyForm.get(key)?.value);
      }
    });

    return formData;
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  resetForm(): void {
    this.companyForm.reset();
  }

  goBack() {
    this.router.navigate(['/company/company-list']);
  }

  // Other existing code...

  // Method to handle file selection
  // onFileSelected(event: any): void {
  //   const file = event.target.files[0];
  //   this.companyForm.patchValue({ companyLogo: file });
  //   this.companyForm.get('companyLogo')?.updateValueAndValidity();

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
      const maxSizeInKB = 150; // Set maximum size limit to 250 KB
      const fileSizeInKB = file.size / 1024;

      if (fileSizeInKB > maxSizeInKB) {
        // this.toastr.error('File size must be less than 250 KB!');
        
        // Reset file input and error state
        event.target.value = null;
        this.companyForm.patchValue({ companyLogo: null });
        this.selectedLogo = null;
        this.fileSizeError = true; // Set file size error to true
        return;
      } else {
        this.fileSizeError = false; // Reset error state if file is valid
      }

      this.companyForm.patchValue({ companyLogo: file });
      this.companyForm.get('companyLogo')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedLogo = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
