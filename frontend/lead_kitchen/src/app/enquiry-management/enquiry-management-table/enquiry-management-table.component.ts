import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation, MatStepperModule } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FileUploadService } from 'src/app/services/FileUploadService/file-upload.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DetailsComponent } from '../details/details.component';
import * as XLSX from 'xlsx';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';
import { Enquiry, EnquiryDetail } from 'src/app/models/enquiry.model';
import { log } from 'console';
import { PageEvent } from '@angular/material/paginator';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

export interface Student {
  id: number;
  createdOn: string;
  contact_person: string;
  loginUserName: string;
  name: string;
  business_name: string;
  // product_service: string;
  status_main: string;
  quotationMailSend: string;
  isExpanded: boolean;
  details?: {
    date: Date | string;
    remark: string;
    status: string;
    time?: string;
    member_files?: any[];
  }[];
}

interface memberdetails {
  member_files: [];
  auto_attachments: [[]];
}

@Component({
  selector: 'app-enquiry-management-table',
  templateUrl: './enquiry-management-table.component.html',
  styleUrls: ['./enquiry-management-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
    trigger('slideInOut', [
      state(
        'in',
        style({
          transform: 'translateX(0)'
        })
      ),
      transition('void => *', [
        style({
          transform: 'translateX(100%)'
        }),
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate(
          '300ms ease-in',
          style({
            transform: 'translateX(100%)'
          })
        )
      ])
    ])
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ]
})
export class EnquiryManagementTableComponent {
  detailItem = '';

  currentRowSelected!: Student;

  displayedColumns = [
    'expand',
    'id',
    'createdOn',
    'loginUserName',
    'business_name',
    // 'product_service',
    'contact_person',

    'status_main',
    'quotationMailSend',
    'action'
  ];

  statusOptions: string[] = [
    'New Enquiry',
    'Quotation Send',
    'Confirmed',
    'Work in Progress',
    'Note',
    'Follow Up',
    'Meeting',
    'Document Upload',
    'Completed',
    'On Hold',
    'Rejected'
  ];
  associationForm!: FormGroup;
  uploadedFiles: any[][] = [];
  userRole: string | null = null;
  userName: string | null = null;
  selectCompany: string | null = null;
  userId: number | undefined;
  loginUserId: number | null = null;
  data: Enquiry[] = [];
  selectEnqMaster: any[] = [];
  stepperOrientation: Observable<StepperOrientation>;
  allEnquiryCount: number = 0;
  QuotationCount: number = 0;
  ConfirmedOrder: number = 0;
  selectedStepIndex: number = 0;
  ProjectCompleted: number = 0;
  WorkInProgress: number = 0;
  onHoldCount: number = 0;
  rejectedCount: number = 0;
  currentDate: string;
  currentDateTime: string;
  isLoading = false;

  p: number = 1;
  itemsPerPage: number = 25;
  totalItems: number = 0;

  pagination: PaginationInstance = {
    id: 'custom',
    itemsPerPage: this.itemsPerPage,
    currentPage: this.p,
    totalItems: 0
  };
  config: NgbPaginationConfig = new NgbPaginationConfig();
  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
    private toastr: ToastrService,
    private fileupload: FileUploadService,
    breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    private enquiryService: EnquiryManagementService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource.data = this.data;

    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

    this.config.maxSize = 5;
    this.config.boundaryLinks = true;

    // Set currentDate to today's date in the format 'YYYY-MM-DD'
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];

    // Set currentDateTime to the current date and time in the format 'YYYY-MM-DDTHH:mm'
    const now = new Date();
    this.currentDateTime = now.toISOString().slice(0, 16);
  }

  itemsPerPageOptions: number[] = [25, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.loadEnquiries();
  }

  ngOnInit(): void {
    this.dataSource.data.forEach((student) => {
      if (!student.details || student.details.length === 0) {
        this.addDetail(student);
      }
    });

    this.detailFormGroup = this.formBuilder.group({
      member_files: [] // You can initialize with any default value if needed
    });
    this.sessionDate();
    this.loadEnquiries();
    this.badgesCount();
    this.getActiveEnquiriesMasterDropdown();
  }

  sessionDate() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.loginUserId = user.user ? user.user.id : null;
    this.selectCompany = user.user ? user.user.select_company : null;

    this.userRole = user?.user?.role || null;
    this.userName = user?.user?.fullname || null;

    this.updateDisplayedColumns();
  }
  updateDisplayedColumns() {
    this.displayedColumns = [
      'expand',
      'id',
      'createdOn',
      'name',
      'business_name',
      // 'product_service',
      'contact_person',

      'status_main',
      'quotationMailSend',
      'action'
    ];
    if (this.userRole === 'manager') {
      const index = this.displayedColumns.indexOf('contact_person');
      if (index !== -1) {
        this.displayedColumns.splice(index + 1, 0, 'contact_number');
      }
    }
  }
  formattedDate(date: string): string {
    // Check if date is provided
    if (date) {
      // Create a new Date object from the ISO string
      const newDate = new Date(date);
      // Get the time zone offset in minutes
      const offsetMinutes = newDate.getTimezoneOffset();
      // Adjust the date by subtracting the offset in minutes
      newDate.setTime(newDate.getTime() - offsetMinutes * 60000);
      // Convert date to string in the format 'YYYY-MM-DD'
      return newDate.toISOString().split('T')[0];
    }
    // If no date provided, return empty string
    return '';
  }

  getActiveEnquiriesMasterDropdown(page: number = 1, pageSize: number = 10): void {
    if (this.selectCompany) {
      this.enquiryService.getActiveEnquiriesMaster(this.selectCompany, page, pageSize).subscribe(
        (response: any) => {
          this.selectEnqMaster = response.data.map((item: any) => item.status_name);
        },
        (error: any) => {
          // this.toastr.error('Error fetching enquiries. Please try again later.');
        }
      );
    } else {
      // this.toastr.error('Enquiries not found in session.');
    }
  }

  loadEnquiries(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user.user ? user.user.id : null;
    const userRole = user.user ? user.user.role : null;
    const loginCompany = user.user ? user.user.select_company : null;

    this.isLoading = true;
    if (userRole && loginCompany) {
      this.enquiryService.getAllEnquiriesList(userId, this.p, this.itemsPerPage, userRole, loginCompany).subscribe(
        (data: any) => {
          this.dataSource.data = data.data;
          this.totalItems = data.total; // Ensure you use the correct total count
          this.pagination = { ...this.pagination, totalItems: this.totalItems };
          this.badgesCount();
          this.stepSelectionChanged(this.selectedStepIndex); // Update filtering based on selected step
        this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;

          // this.toastr.error('Error fetching enquiries');
        }
      );
    } else {
      this.isLoading = false;

      // this.toastr.error('Enquiries not found in session.');
    }
  }

  

  // Function to handle pagination change event
  onPageChange(page: number) {
    this.p = page;
    this.loadEnquiries();
  }

  badgesCount(): void {
    // Calculate the count of 'New Enquiry' status_main
    this.allEnquiryCount = this.dataSource.data.length;
    this.QuotationCount = this.dataSource.data.filter((x) => x.quotationMailSend == 'yes').length;
    this.ConfirmedOrder = this.dataSource.data.filter((x) => x.status_main == 'Confirmed').length;
    this.ProjectCompleted = this.dataSource.data.filter((x) => x.status_main == 'Completed').length;
    this.WorkInProgress = this.dataSource.data.filter((x) => x.status_main == 'Work in Progress').length;
    this.onHoldCount = this.dataSource.data.filter((x) => x.status_main == 'On Hold').length;
    this.rejectedCount = this.dataSource.data.filter((x) => x.status_main == 'Rejected').length;
    this.cdr.detectChanges();
  }

  expandCollapse(row: Enquiry, event: any): void {
    row.isExpanded = !row.isExpanded;
    if (row.isExpanded) {
      this.loadEnquiryDetails(row.id);
    }
  }

  loadEnquiryDetails(enquiryId: number): void {
    this.enquiryService.getEnquiryDetails(enquiryId).subscribe((details: any) => {
      // Find the enquiry in the dataSource array
      const enquiryIndex = this.dataSource.data.findIndex((enq) => enq.id === enquiryId);
      if (enquiryIndex !== -1) {
        // Set the details for the corresponding enquiry
        this.dataSource.data[enquiryIndex].details = details.data;

        // If there are no details available, add an empty detail row
        if (!details.data || details.data.length === 0) {
          this.addDetail(this.dataSource.data[enquiryIndex]);
        }

        // Triggering data source update after modifying data
        this.dataSource._updateChangeSubscription();
      }
    });
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, enquiryId: number): void {
    const mainTableData = this.dataSource.data.find((enquiry) => enquiry.id === enquiryId);

    const dialogRef = this.dialog.open(DetailsComponent, {
      width: '700px',
      position: {
        right: '0px',
        top: '70px'
      },
      data: { enterAnimationDuration, exitAnimationDuration, enquiryId, mainTableData },
      panelClass: 'slide-dialog' // Apply custom class for animation
    });
  }
  openForm() {
    this.router.navigate(['/enquiry/form']);
  }
  // ------------------------------table-------------------------------------------

  dataSource = new MatTableDataSource<Enquiry>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  ngAfterViewInit() {
    // Connect the paginator and sort to the dataSource
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addDetail(student: Student): void {
    if (!student.details) {
      student.details = [];
    }
    student.details.push({ date: '', remark: '', status: '', time: '', member_files: [] }); // Initialize date with an empty string and an empty file array
    this.uploadedFiles.push([]); // Initialize an empty array to store uploaded files for this detail row
  }
  selectedFile: string | ArrayBuffer | null = null;
  detail: EnquiryDetail = {
    id: 0,
    enquiryId: 0,
    date: new Date(), // Initialize with appropriate default date or leave as string
    remark: '',
    status: 'Document Upload', // Ensure status is correctly set
    member_files: [], // Initialize as an empty array
    submitted: false,
    time: ''
  };

  clearFile(): void {
    this.detail.member_files = []; // Clear the uploaded file
  }

  stepSelectionChanged(stepIndex: number) {
    // Define a variable to hold the status to filter
    let statusToFilter = '';

    // Check if the stepIndex is for "All Leads", which is typically index 0
    if (stepIndex === 0) {
      // Reset the filter and show entire data
      this.dataSource.filter = '';
      return; // Exit the function early since no further processing is needed
    }

    // Set the status based on the selected step
    switch (stepIndex) {
      case 1:
        statusToFilter = 'yes';
        break;
      case 2:
        statusToFilter = 'Confirmed';
        break;
      case 3:
        statusToFilter = 'Work in Progress';
        break;
      case 4:
        statusToFilter = 'Completed';
        break;
      case 5:
        statusToFilter = 'On Hold';
        break;
      case 6:
        statusToFilter = 'Rejected';
        break;
      default:
        break;
    }

    // Apply the filter to the data source
    this.dataSource.filter = statusToFilter.trim().toLowerCase();
    this.cdr.detectChanges();
  }

  submitClicked: boolean = false;

  onFileSelected(event: any, detail: EnquiryDetail): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      detail.selectedFile = file; // Store the file in the detail object
    }
  }

  submit(): void {
    this.isLoading = true;
    // Iterate over each row in the dataSource
    this.dataSource.data.forEach((enquiry: Enquiry) => {
      // Check if the row has details
      if (enquiry.details && enquiry.details.length > 0) {
        // Iterate over each detail
        enquiry.details.forEach((detail: EnquiryDetail) => {
          // Create FormData for each detail
          const formData = new FormData();
          formData.append('date', detail.date.toString()); // Adjust according to your actual date handling
          formData.append('remark', detail.remark);
          formData.append('status', detail.status);
          formData.append('time', detail.time);
          if (detail.selectedFile instanceof Blob) {
            formData.append('member_files', detail.selectedFile, detail.selectedFile.name); // Append the file here
          }

          // Append user-related information with default empty strings if null
          formData.append('loginUserName', this.userName || '');
          formData.append('role', this.userRole || '');
          formData.append('login_company', this.selectCompany || '');

          if (detail.id) {
            // Update existing detail
            this.enquiryService.updateEnquiryDetail(detail.id, formData).subscribe(
              (response: any) => {},
              (error: any) => {}
            );
          } else {
            // Add new detail
            this.enquiryService.createEnquiryDetail(enquiry.id, formData).subscribe(
              (response: any) => {
                this.toastr.success('Data added Successfully');
                window.location.reload();  
                this.isLoading = false;
              },
              (error: any) => {
                this.toastr.error('Failed to add enquiryDetail');
                this.isLoading = false;
              }
            );
          }
        });
      }
    });

    // Reset the submitClicked flag after submission is complete
    this.submitClicked = false;
  }

  addEnquiryDetail(detail: EnquiryDetail, enquiryId: number): void {
    if (!enquiryId) {
      return;
    }

    const formData = new FormData();
    formData.append('date', detail.date.toString()); // Adjust according to your actual date handling
    formData.append('remark', detail.remark);
    formData.append('status', detail.status);
    formData.append('time', detail.time);
    if (this.selectedFile instanceof Blob) {
      formData.append('member_files', this.selectedFile, this.selectedFile.name); // Append the file here
    }

    this.enquiryService.createEnquiryDetail(enquiryId, formData).subscribe(
      (response: any) => {
        this.toastr.success('Data added Successfully');
        // window.location.reload();
      },
      (error: any) => {
        this.toastr.error('Failed to add enquiryDetail');
      }
    );
  }

  updateEnquiryDetail(detail: EnquiryDetail): void {
    const formData = new FormData();
    formData.append('date', detail.date.toString()); // Adjust according to your actual date handling
    formData.append('remark', detail.remark);
    formData.append('status', detail.status);
    formData.append('time', detail.time);
    if (this.selectedFile instanceof Blob) {
      formData.append('member_files', this.selectedFile, this.selectedFile.name); // Append the file here
    }

    this.enquiryService.updateEnquiryDetail(detail.id, formData).subscribe(
      (response: any) => {
        this.toastr.success('EnquiryDetail updated Successfully');
      },
      (error: any) => {
        this.toastr.error('Failed to update enquiryDetail');
      }
    );
  }

  removeDetail(enquiryId: number, detailId: number): void {
    if (detailId) {
      if (confirm(`Are you sure you want to delete this EnquiryDetail row?`)) {
        this.enquiryService.deleteEnquiryDetail(enquiryId, detailId).subscribe(
          () => {
            this.toastr.success('Data deleted successfully');
            this.loadEnquiries(); // Refresh the customer list after deletion
          },
          (error) => {
            this.toastr.error('Error deleting EnquiryDetail');
          }
        );
      }
    } else {
      if (confirm(`Are you sure you want to delete this EnquiryDetail row?`)) {
        const index = this.dataSource.data.findIndex((enquiry) => enquiry.id === enquiryId);
        if (index !== -1) {
          this.dataSource.data[index].details = this.dataSource?.data[index]?.details?.filter((detail) => detail.id !== detailId);
          this.toastr.success('Data deleted successfully');
        } else {
        }
      }
    }
  }

  deleteCustomer(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete User ${name} ?`)) {
      this.enquiryService.deleteEnquiry(id).subscribe(
        () => {
          this.toastr.success('User deleted successfully');
          this.loadEnquiries();
        },
        (error) => {
          this.toastr.error('Error deleting User');
        }
      );
    }
  }
  detailFormGroup: FormGroup | undefined;
  attachmentControlName: string = 'member_files';

  submitData(student: Student): void {}

  editCustomer(id: number): void {
    this.router.navigate(['/enquiry/form', id], { skipLocationChange: true });
  }
  // -----------------------------------table-------------------------------------------------
  isFormValid(): boolean {
    for (const enquiry of this.dataSource.data) {
      if (enquiry.details && enquiry.details.length > 0) {
        for (const detail of enquiry.details) {
          if (!detail.id && (!detail.date || !detail.remark)) {
            return false;
          }
        }
      }
    }
    return true; // Form is valid
  }

  resetForm(): void {}

  // --------------------file upload-----------------------------------

  constitution_attach_array: Array<number> = [];
  @Input() attachmentValue1: string = 'auto_attachments';
  auto_attachments: any = [];
  onChange: any = () => {};
  onTouched: any = () => {};
  subscriptions: any[] = [];
  progress: number = 0;
  attachment1: string = 'attach';

  set value(value: memberdetails) {
    this.associationForm.patchValue(value);
    if (value.member_files && value.member_files.length) {
      this.constitution_attach_array = value.member_files;
    }

    if (value.auto_attachments && value.auto_attachments.length) {
      this.auto_attachments = value.auto_attachments;
    }
    this.onChange(value);
    this.onTouched();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: any) => s.unsubscribe());
  }
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  writeValue(value: any) {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.associationForm.reset();
    }
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  previewFile(file: any) {
    window.open(file.file_path);
  }

  deleteFile(file: any) {
    if (file) this.deleteFileFunction(file.id);
  }

  // uploadFiles(files: any) {
  //   if (files.length) this.UploadFileFunction(files[0]);
  // }

  uploadFiles(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    this.UploadFileFunction(file);
    /** do something with the file **/
  }

  deleteFileFunction(id: number) {
    let res = this.fileupload.deleteFile(id).subscribe(
      (result) => {
        this.constitution_attach_array = this.constitution_attach_array.map(function (val: any) {
          return parseInt(val);
        });

        //remove id from array containing all id as number
        const index = this.constitution_attach_array.indexOf(id);

        if (index !== -1) {
          this.constitution_attach_array.splice(index, 1);

          // this.memberForm.value.member_files.setValue(this.constitution_attach_array);
          this.associationForm.patchValue({
            member_files: this.constitution_attach_array
          });
        }
        // delete id details form array of file
        for (let i = 0; i < this.auto_attachments.length; i++) {
          if (this.auto_attachments[i].id === id) {
            this.auto_attachments.splice(i--, 1);
          }
        }
        // this.alertService.success(result.message);
      },
      (error) => {
        // this.alertService.success(error);
      }
    );
  }
  get f() {
    return this.associationForm.controls;
  }
  UploadFileFunction(uplaodfile: any) {
    let res = this.fileupload.uploadFile(uplaodfile, uplaodfile.remark).subscribe(
      (event: HttpEvent<any>) => {
        // this.alertService.clear();
        /* if (typeof (event) === 'object') { */
        switch (event.type) {
          case HttpEventType.Sent:
            break;
          case HttpEventType.ResponseHeader:
            break;
          case HttpEventType.UploadProgress:
            this.progress = Math.round((event.loaded / (event.total || 1)) * 100);
            break;
          case HttpEventType.Response:
            let upload_resp = event.body.data;
            if (upload_resp) {
              if (upload_resp.remark == this.attachmentValue1) {
                this.auto_attachments.push(upload_resp);
                if (this.constitution_attach_array.indexOf(Number(upload_resp.id)) === -1) {
                  this.constitution_attach_array.push(Number(upload_resp.id));

                  this.f['member_files'].setValue(this.constitution_attach_array);
                }
              }
            }
            // this.alertService.success('File successfully uploaded!');
            setTimeout(() => {
              this.progress = 0;
            }, 1500);
        }
      },
      (error) => {
        // this.alertService.error(error);
        this.reset();
      }
    );
  }
  reset() {
    this.progress = 0;
  }

  // ----------------------- file upload -----------------------
}
