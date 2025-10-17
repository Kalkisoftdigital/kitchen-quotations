import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, NgZone, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, forkJoin, from, map, startWith } from 'rxjs';
import { CustomerService } from 'src/app/services/customer-management-service/customer.service';
import { QuotationManagementService } from 'src/app/services/quotation-management-service/quotation-management.service';
import { ProductsService } from 'src/app/services/service&product-service/products/products.service';
import { ServicesService } from 'src/app/services/service&product-service/services/services.service';
import { QuotationDescription, Quotation, QuotationResponse, PeriodicElement } from 'src/app/models/enquiry_mngt.model';


@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss']
})
export class QuotationComponent {
  serviceSelected: boolean = false;
  productSelected: boolean = false;
  loginUserRole: string | null = null;
  fileSizeError: boolean = false; // To track file size error
  selectedLogos: string[] = []; // Array to hold selected image previews
  @ViewChild(MatSort) sort!: MatSort;
  // @ViewChild(QuotationProductTableComponent) quotationProductTable!: QuotationProductTableComponent;
  grandTotal: number = 0;
  editingMode: boolean = false;
  selectedQuotation: any | null = null;
  selectCustomer: any[] = [];
  selectServices: any[] = [];
  selectCategory: string = '';
  filteredServices: { [key: string]: any[] } = {};
  isCopyMode: boolean = false;
  isGetItemListMode: boolean = false;

  serviceSearchCtrl = new FormControl();
  filteredServices$: Observable<any[]> = new Observable();
  selectProducts: any[] = [];
  nextQuotationId!: number;
  customerForm!: FormGroup;
  totalShutterArea: any;
  isSendingEmail: boolean = false;
  loginUserId: number | null = null;
  superAdminId: number | null = null;
  myCompany: string | null = null;
  loginUserName: string | null = null;
  minDate!: Date;
  // form: FormGroup;
  disabled: boolean = true;
  isLoading = false;
  dataSource = new MatTableDataSource<PeriodicElement>();
  itemDescriptionControl = new FormControl();
  productDescriptionControl = new FormControl();
  filteredOptions!: Observable<string[]>;
  displayedColumns: string[] = [
    'add',
    'select_service',
    'itemDescription',
    'hsn_code',
    'unit_of_measurement',
    'quantity',
    'rate',
    'initial_discount',
    'initial_sgst',
    'initial_cgst',
    'initial_igst',
    'amount',
    'edit',
    'delete'
  ];
  // Add static objects to the form array
  staticData = [];
  fb: any;
  constructor(
    private formBuilder: FormBuilder,
    private _liveAnnouncer: LiveAnnouncer,
    private toastr: ToastrService,
    private quotationService: QuotationManagementService,
    private router: Router,
    private customerService: CustomerService,
    private productService: ProductsService,
    private servicesService: ServicesService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }
  QuotationId: number | undefined;

  ngOnInit(): void {
    this.customerForm = this.formBuilder.group({
      quotations_descriptions: this.formBuilder.array([]),

      quotation_id: [''],
      quotation_date: [this.formatDate(new Date())],
      reference: [''],
      contact_number: [''],
      email: [''],
      business_name: [''],
      agent_commission: ['0'],
      amount_show_hide: ['hideAmount'],
      customer_name: [''],
      consignee_address: [''],
      gstin_no: [''],
      state: [''],
      select_customer: ['', Validators.required],
      transport: ['0'],
      discount: [''],

      discountedAmount: { value: '', disabled: true },
      IGST: [''],
      igstAmount: { value: '', disabled: true },
      cgst: [''],
      cgstAmount: { value: '', disabled: true },
      sgst: [''],
      sgstAmount: { value: '', disabled: true },
      total_quantity: [''],
      total_rate: [''],
      total_amount: [''],
      integrated_amount: [''],
      special_discount: ['0'],
      special_discount_remark: [''],
      copy_remark: [''], //copy quotation remark
      is_coppied: [''], //copy quotation remark
      type_of_commission: [''], //copy quotation remark
      companyLogoOne: this.formBuilder.array([]),
      special_discount_total: [''],
      discounted_total_amount_display: [''],
      grand_total: { value: '', disabled: true },
      grand_total_in_words: [''],
      other_charges: ['0'],
      remark: [
        '1. Payment Term -- 70% Advance With Purchase Order, 20% Before Dispatch & 10% After Installation Of Site. \n2. Production Time -- 45 Days After Order Confirmatiion. \n3. Installation Time --- 5 Days On Site. \n4. Tax- 18 % Gst Is Extra Or As Applicable. \n5. Above Quotation Does Not Inclued Granite, Cement, Cement Sheet, Sand, Fridge, Chimaney Hob, Ovens, Sink, Tab Any Civil Labour Charges, Tiels, Plumbing Work and Food Disposer \n6. We Only Provide Electrical, Plumbing, Wall Tiles 2d Drawing. \n7. If You Want Electrical, Plumbing Marking On Site Than, Rs 2000/- Will Be Visiting Charges Which Is Not Included In Quotation. \n8. 30 Days For Installation After Granite, Wall Tiles Work. \n9. Once Order Placed Cannot Be Cancelled Or Refunded. \n10. Quotation Valid For 30 Days From Date Of Issue.'
      ]
    });
    //row_commission not updated in duplicate
    this.customerForm.get('agent_commission')?.valueChanges.subscribe((commissionValue) => {
      this.updateRowCommissions(commissionValue);
    });

    this.getAllItemFromItems()

    this.subscribeToValueChangess();
    this.addItem();
    // this.subscribeToAgentCommissionChanges();
    this.subscribeToTotalAmountChanges();
    this.subscribeToSpecialDiscountChanges();
    this.subscribeToValueChanges();
    this.serviceCall();
    this.fetchNextQuotationId();
    this.quotations_descriptions.get('amount')?.setValue(0, { emitEvent: false });
    this.subscribeToQuantityChanges();
    this.subscribeToRowCommissinChanges();
    this.subscribeToRateChanges();
    this.subscribeToDiscount_Changes();
    this.subscribeToIGST_Changes();
    this.subscribeToCGST_Changes();
    this.subscribeTofree_item_amountChanges();
    this.subscribeToSGST_Changes();
    this.subscribeToarea_shutter_Changes();
    this.subscribeToadd_extra_area_Changes();
    this.subscribeToshutter_area_other_Changes();
    // this.getNextQuotationId();
    // this.fetchServices();

    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.loginUserId = user?.user?.id || null;
    this.loginUserName = user?.user?.fullname || null;
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
        (error: any) => { }
      );
    }

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.QuotationId = +params['id'];
        this.editQuotation(this.QuotationId);


      }
    });
    this.route.queryParams.subscribe((params) => {
      this.isCopyMode = params['createCopy'] === 'true';
    });

    this.filteredServices$ = this.serviceSearchCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterServices(value))
    );

    // Set minimum date to today
    this.minDate = new Date();
    // Optional: Set the time to 00:00:00 to avoid any time zone issues
    this.minDate.setHours(0, 0, 0, 0);
    this.sessionData();

    // Subscribe to changes in amount_show_hide field
    this.customerForm.get('amount_show_hide')?.valueChanges.subscribe((selectedValue) => {
      this.updateInitialDiscounts(selectedValue);
    });

    this.customerForm.get('agent_commission')?.valueChanges.subscribe((selectedValue) => {
      this.updateEachRowCommission(selectedValue);
    });

    let aaa = this.quotations_descriptions.get('item_category')?.value == 'OTHERS';
    if (aaa) {
      this.quotations_descriptions.get('initial_sgst')?.disable();
      this.quotations_descriptions.get('initial_cgst')?.disable();
      this.quotations_descriptions.get('initial_igst')?.disable();
    }

  }
  //row_commission not updated in duplicate
  updateRowCommissions(commissionValue: any): void {
    this.quotations_descriptions.controls.forEach((row: AbstractControl) => {
      row.get('row_commission')?.setValue(commissionValue, { emitEvent: false });
    });
  }

  private updateInitialDiscounts(selectedValue: string): void {
    this.quotations_descriptions.controls.forEach((control: AbstractControl) => {
      control.get('initial_discount')?.setValue(selectedValue);
    });
  }

  private updateEachRowCommission(selectedValue: string): void {
    this.quotations_descriptions.controls.forEach((control: AbstractControl) => {
      control.get('row_commission')?.setValue(selectedValue);
    });
  }


  filterServices(searchValue: string): any[] {
    if (!searchValue) {
      return this.selectServices; // Return full list if no search input
    }
    const filterValue = searchValue.toLowerCase();
    return this.selectServices.filter(service =>
      service.service_name.toLowerCase().startsWith(filterValue)
    );
  }
  onDropdownOpened() {
    // Reset the search control when the dropdown is opened
    this.serviceSearchCtrl.setValue(''); // Optional: Uncomment if you want to clear the input
    this.filteredServices$ = this.serviceSearchCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterServices(value))
    );
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
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
  //shutter calculation
  calculateTotalShutterData() {
    let totalShutterData = 0;
    let combineShutterData = 0;
    // Loop over each row in the form array
    this.quotations_descriptions.controls.forEach((control: AbstractControl) => {
      const quantity = parseFloat(control.get('quantity')?.value || '1');
      const initial_sgst = parseFloat(control.get('initial_sgst')?.value || '0');
      const initial_cgst = parseFloat(control.get('initial_cgst')?.value || '0');
      const initial_igst = parseFloat(control.get('initial_igst')?.value || '0');
      const add_extra_area = parseFloat(control.get('add_extra_area')?.value || '0');

      const sgstInFeet = this.convertMmToFeet(initial_sgst);
      const cgstInFeet = this.convertMmToFeet(initial_cgst);
      const shutter_area_other = parseFloat(control.get('shutter_area_other')?.value || '0');
      const selectedCategory = control.get('item_category')?.value;

      let SHUTTERDATA = 0;

      const igstInFeet = this.convertMmToFeet(initial_igst); //height
      // Calculate SHUTTERDATA for each row
      if (selectedCategory === 'OTHER-CABINET') {
        SHUTTERDATA = shutter_area_other * quantity;

      } else if (selectedCategory === 'FREE-ITEM') {
        SHUTTERDATA = 0;

      } else {
        SHUTTERDATA = (sgstInFeet * igstInFeet * quantity) + add_extra_area;

      }

      // Add to the totalShutterData
      totalShutterData += SHUTTERDATA;
      combineShutterData = totalShutterData;
      // Store it in the area_shutter field for the current row
      // control.get('area_shutter')?.setValue(totalShutterData.toFixed(2), { emitEvent: false });
    });

    // Store the total shutter area in a class-level variable for use in amount calculation
    this.totalShutterArea = combineShutterData;


    this.quotations_descriptions.controls.forEach((control: AbstractControl) => {
      control.get('area_shutter')?.setValue(combineShutterData.toFixed(2), { emitEvent: false });
    });
  }

  //--------------------- special discount start---------------------------

  onCommissionChange(event: any): void {

    this.isReadOnly = true; // Set the flag to true
    if (!this.editingMode) {
      this.isReadOnly = true; // Set the flag to true only when not editing
    }
  }
  subscribeToSpecialDiscountChanges() {
    this.customerForm.get('special_discount')?.valueChanges.subscribe(() => {
      this.calculateSpecialDiscount();
      this.calculateGrandTotal(); // Recalculate grand total after applying special discount
    });
  }

  calculateSpecialDiscount() {
    const totalAmount = parseFloat(this.customerForm.get('total_amount')?.value || '0');
    const specialDiscount = parseFloat(this.customerForm.get('special_discount')?.value || '0');

    // Calculate special discount
    const specialDiscountTotal = (specialDiscount / 100) * totalAmount;

    // Update the special_discount_total field
    this.customerForm.get('special_discount_total')?.setValue(specialDiscountTotal.toFixed(2));
  }
  //--------------------- special discount end---------------------------

 editQuotation(quotation_id: number): void {
  this.isLoading = true;
  const quotationObservable = this.isProductTableSelected
    ? this.quotationService.getquotationWithProductById(quotation_id)
    : this.quotationService.getQuotationById(quotation_id);

  quotationObservable.subscribe(
    (response: any) => {
      this.isLoading = false;

      if (response && response.data && response.data.quotation) {
        const quotationData = response.data.quotation;
        const descriptionData = response.data.descriptions;
        
        // Safely parse select_customer
        let selectCustomer;
        try {
          selectCustomer = typeof quotationData.select_customer === 'string' 
            ? JSON.parse(quotationData.select_customer) 
            : quotationData.select_customer;
        } catch (e) {
          selectCustomer = {};
          console.error('Error parsing select_customer:', e);
        }

        // Reset the form to clear previous values
        this.customerForm.reset();
        this.customerForm.patchValue({
          select_customer: selectCustomer,
          quotation_id: quotationData.quotation_id,
          quotation_date: quotationData.quotation_date,
          reference: quotationData.reference,
          contact_number: quotationData.contact_number,
          email: quotationData.email,
          business_name: quotationData.business_name,
          agent_commission: quotationData.agent_commission,
          amount_show_hide: quotationData.amount_show_hide,
          row_commission: quotationData.row_commission,
          customer_name: quotationData.customer_name,
          consignee_address: quotationData.consignee_address,
          gstin_no: quotationData.gstin_no,
          state: quotationData.state,
          transport: quotationData.transport,
          discount: quotationData.discount,
          discountedAmount: quotationData.discountedAmount,
          IGST: quotationData.IGST,
          igstAmount: quotationData.igstAmount,
          cgst: quotationData.cgst,
          cgstAmount: quotationData.cgstAmount,
          sgst: quotationData.sgst,
          sgstAmount: quotationData.sgstAmount,
          total_quantity: quotationData.total_quantity,
          total_rate: quotationData.total_rate,
          total_amount: quotationData.total_amount,
          grand_total: quotationData.grand_total,
          special_discount: quotationData.special_discount,
          special_discount_remark: quotationData.special_discount_remark,
          copy_remark: quotationData.copy_remark,
          is_coppied: quotationData.is_coppied,
          type_of_commission: quotationData.type_of_commission,
          special_discount_total: quotationData.special_discount_total,
          discounted_total_amount_display: quotationData.discounted_total_amount_display,
          integrated_amount: quotationData.grand_total,
          grand_total_in_words: quotationData.grand_total_in_words,
          other_charges: quotationData.other_charges,
          remark: quotationData.remark.replace(/<br>/g, '\n')
        });

        const descriptionsArray = this.customerForm.get('quotations_descriptions') as FormArray;
        descriptionsArray.clear();
        
        descriptionData.forEach((description: any) => {
          // Safely parse select_service
          let selectService;
          try {
            selectService = typeof description.select_service === 'string'
              ? JSON.parse(description.select_service)
              : description.select_service;
          } catch (e) {
            selectService = {};
            console.error('Error parsing select_service:', e);
          }

          const descriptionGroup = this.formBuilder.group({
            id: [description.quotationdesc_id],
            select_service: [selectService],
            service_name: [description.service_name],
            item_name: [description.item_name],
            item_category: [description.item_category],
            itemDescription: [description.itemDescription],
            hsn_code: [description.hsn_code],
            unit_of_measurement: [description.unit_of_measurement],
            quantity: [description.quantity],
            rate: [description.rate],
            initial_discount: [description.initial_discount],
            initial_sgst: [description.initial_sgst],
            initial_cgst: [description.initial_cgst],
            initial_igst: [description.initial_igst],
            amount: [description.amount],
            free_item_amount: [description.free_item_amount],
            purchase_price: [description.purchase_price],
            shelves_count: [description.shelves_count],
            al_profile: [description.al_profile],
            multitop_profile: [description.multitop_profile],
            plastic_clip: [description.plastic_clip],
            valleyht_profile: [description.valleyht_profile],
            area_shutter: [description.area_shutter],
            shutter_area_other: [description.shutter_area_other],
            add_extra_area: [description.add_extra_area],
            safeTotalShutterArea: [description.safeTotalShutterArea],
            free_item_desc: [description.free_item_desc],
            row_commission: [description.row_commission]
          });

          this.totalShutterArea = description.area_shutter;

          // Disable specific fields based on select_service value
          if (selectService && selectService.item_category === 'OTHERS') {
            descriptionGroup.get('initial_sgst')?.disable();
            descriptionGroup.get('initial_cgst')?.disable();
            descriptionGroup.get('initial_igst')?.disable();
          }

          descriptionsArray.push(descriptionGroup);
        });

        this.editingMode = true;
        this.isGetItemListMode = false;
        this.selectedQuotation = quotationData;
        this.customerForm.get('select_customer')?.disable();
        
        this.quotations_descriptions.controls.forEach((control) => {
          let aaa = control.get('item_category')?.value == 'OTHERS';
          if (aaa) {
            control.get('initial_sgst')?.disable();
            control.get('initial_cgst')?.disable();
            control.get('initial_igst')?.disable();
          }
        });
      } else {
        this.toastr.error('Error fetching Quotation data!');
      }
    },
    (error: any) => {
      this.isLoading = false;
      this.toastr.error('Error fetching Quotation data!');
    }
  );
}



  get quotations_descriptions(): FormArray {
    return this.customerForm.get('quotations_descriptions') as FormArray;
  }
  p: number = 1;

  itemsPerPage: number = 25;


  patchStaticDataToFormArray() {
    this.staticData.forEach((data: any, index: number) => {
      const currentDiscountValue = this.customerForm.get('amount_show_hide')?.value || '';
      const currentrowcommission = this.customerForm.get('agent_commission')?.value || '';
      const shouldDisableFields = data.select_category === 'OTHERS';
      const isCabinetCategory = data.select_category === 'SHUTTER';
      const logoUrl = data.companyLogo
        ? `https://kitchen-backend-2.cloudjiffy.net/${data.companyLogo.replace(/\\/g, '/')}`
        : 'assets/images/placeholder-logo.png'; // Fallback placeholder image
      const selectedCategory = this.quotations_descriptions.get('select_service')?.value?.select_category;

      const staticDescriptionGroup = this.formBuilder.group({

        service_name: [data.service_name],
        select_category: [data.select_category || ''],//
        select_sub_category: [data.select_sub_category || ''],//
        item_name: [data.service_name],
        item_category: [data.select_category],
        itemDescription: [data.service_desc || ''],
        hsn_code: [logoUrl || ''],
        unit_of_measurement: [data.unit_of_measurement || ''],
        quantity: ['1'],
        rate: [data.selling_price || ''],
        initial_discount: [currentDiscountValue],
        initial_sgst: [shouldDisableFields || isCabinetCategory ? '' : this.convertMmToFeet(parseFloat(data.sgst || '0'))],
        initial_cgst: [shouldDisableFields || isCabinetCategory ? '' : this.convertMmToFeet(parseFloat(data.cgst || '0'))],
        initial_igst: [shouldDisableFields || isCabinetCategory ? '' : this.convertMmToFeet(parseFloat(data.igst || '0'))],
        amount: [''],//
        free_item_amount: [''],//
        purchase_price: [data.purchase_price || '0'],
        shelves_count: [data.shelves_count || '1'],
        al_profile: [data.al_profile || ''],
        multitop_profile: [data.multitop_profile || ''],
        plastic_clip: [data.plastic_clip || ''],
        valleyht_profile: [data.valleyht_profile || ''],
        area_shutter: [''],//
        shutter_area_other: [data.shutter_area_other || ''],
        add_extra_area: [''],//
        safeTotalShutterArea: [''],//
        free_item_desc: [''],//
        row_commission: [currentrowcommission],
        isStaticData: [false] // Indicates that this is preloaded data, not a new entry
      });

      // Disable fields if necessary
      if (shouldDisableFields || selectedCategory === 'OTHERS') {
        staticDescriptionGroup.get('initial_sgst')?.disable();
        staticDescriptionGroup.get('initial_cgst')?.disable();
        staticDescriptionGroup.get('initial_igst')?.disable();
      } else if (isCabinetCategory || selectedCategory === 'SHUTTER') {
        staticDescriptionGroup.get('initial_sgst')?.disable();
        staticDescriptionGroup.get('initial_cgst')?.disable();
        staticDescriptionGroup.get('initial_igst')?.disable();
      } else {
        staticDescriptionGroup.get('initial_sgst')?.enable();
        staticDescriptionGroup.get('initial_cgst')?.enable();
        staticDescriptionGroup.get('initial_igst')?.enable();
      }

      // Insert static data at index 1 (or anywhere you want)
      if (index !== -1) {
        this.quotations_descriptions.insert(-1, staticDescriptionGroup); // Insert at index 1
      } else {
        this.quotations_descriptions.push(staticDescriptionGroup); // Push normally for other items
      }
    });

    // Update the data source for the table
    this.dataSource.data = this.quotations_descriptions.value;
  }

// In your component class:

getAllItemFromItems() {
  const sessionStorageData = sessionStorage.getItem('leadManagement');
  const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
  const myCompany = user.user ? user.user.select_company : null;
  this.isLoading = true;

  if (myCompany && !this.editingMode && !this.isCopyMode) {
    this.isGetItemListMode = true;
    this.servicesService.getAllServicesByCompanys(myCompany).subscribe(
      (response: any) => {
        // Remove the ID filtering - use all services from response
        this.staticData = response.data; // Removed the filter

        // Patch the data into the form array
        this.patchStaticDataToFormArray();
        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading = false;
      }
    );
  } else {
    this.isLoading = false;
  }
}

serviceCall() {
  const sessionStorageData = sessionStorage.getItem('leadManagement');
  const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
  const myCompany = user.user ? user.user.select_company : null;

  if (myCompany) {
    this.servicesService.getAllServicesByCompanys(myCompany).subscribe(
      (response: any) => {
        // Map all services to the required format
        this.selectServices = response.data.map((service: any) => ({
          service_id: service.service_id,
          service_name: service.service_name,
          item_name: service.service_name,
          item_category: service.select_category,
          select_category: service.select_category,
          select_sub_category: service.select_sub_category,
          itemDescription: service.service_desc,
          // Include other properties needed for your form
          selling_price: service.selling_price,
          purchase_price: service.purchase_price,
          sgst: service.sgst,
          cgst: service.cgst,
          igst: service.igst,
          companyLogo: service.companyLogo,
          unit_of_measurement: service.unit_of_measurement,
          shelves_count: service.shelves_count,
          al_profile: service.al_profile,
          multitop_profile: service.multitop_profile,
          plastic_clip: service.plastic_clip,
          valleyht_profile: service.valleyht_profile,
          shutter_area_other: service.shutter_area_other
        }));
      },
      (error: any) => { }
    );
  }
}

 

  selectedItemDescription: string | null = null;
  selectedProductDescription: string | null = null;
  convertMmToFeet(mm: number): number {
    return mm * 0.00328084;
  }
  selectedServices: any[] = []; // Array to track selected services
  isCabinet: boolean = false;
  isShutter: boolean = false;
  isOthers: boolean = false;
  selectedServiceIds: number[] = [];
  
onSelectservice(selectedItem: any, index?: number): void {
  const newRow = this.fb.group({
    service_name: [selectedItem.service_name],
    select_service: [selectedItem],
    item_name: [selectedItem.service_name],
    itemDescription: [selectedItem.description || ''],
    item_category: [selectedItem.category || 'CABINET'],
    isNewEntry: [false],
    isDuplicated: [false],
    hsn_code: [selectedItem.image_url || ''],
    initial_sgst: [0],
    initial_cgst: [0],
    initial_igst: [0],
    area_shutter: [null],
    add_extra_area: [null],
    quantity: [1],
    unit_of_measurement: [selectedItem.unit || 'pcs'],
    free_item_desc: [''],
    free_item_amount: [null]
  });

  this.quotations_descriptions.push(newRow);

  // Optionally remove the row where selection was made
  if (typeof index === 'number') {
    this.removeItem(index);
  }
}


 onSelectService(selectedService: any): void {
  if (this.selectedServiceIds.includes(selectedService.service_id)) {
    this.toastr.error('This Item has already been selected!');
    return;
  }

  this.selectedServiceIds.push(selectedService.service_id);

  if (selectedService.data && selectedService.data.service) {
    const selectedCategory = selectedService.data.service.select_category;

    this.isCabinet = selectedCategory === 'CABINET';
    this.isShutter = selectedCategory === 'SHUTTER';
    this.isOthers = selectedCategory === 'OTHERS';
  }

  this.servicesService.getServiceById(selectedService.service_id).subscribe(
    (response: any) => {
      const { service, descriptions } = response.data;

      const serviceName = service.service_name;
      const serviceDescription = service.service_desc;
      const logoUrl = service.companyLogo
        ? `https://kitchen-backend-2.cloudjiffy.net/${service.companyLogo.replace(/\\/g, '/')}`
        : 'assets/images/placeholder-logo.png';

      const currentDiscountValue = this.customerForm.get('amount_show_hide')?.value || '';
      const currentrowcommission = this.customerForm.get('agent_commission')?.value || '';

      const alProfile = service.al_profile || '0';
      const multitopProfile = service.multitop_profile || '0';
      const plasticClip = service.plastic_clip || '0';
      const valleyhtProfile = service.valleyht_profile || '0';
      const shutterAreaOther = service.shutter_area_other || '0';

      const shouldDisableFields = service.select_category === 'OTHERS';
      const isCabinetCategory = service.select_category === 'SHUTTER';

      const selectedRowIndex = this.quotations_descriptions.controls.findIndex(
        (control: AbstractControl) => control.get('select_service')?.value === selectedService
      );

      if (selectedRowIndex !== -1) {
        const selectedRow = this.quotations_descriptions.at(selectedRowIndex);

        selectedRow.patchValue({
          service_name: serviceName,
          item_name: serviceName,
          item_category: service.select_category,
          itemDescription: serviceDescription,
          hsn_code: logoUrl,
          unit_of_measurement: service.unit_of_measurement,
          rate: service.selling_price,
          initial_discount: currentDiscountValue,
          row_commission: currentrowcommission,
          initial_sgst: shouldDisableFields || isCabinetCategory ? '' : this.convertMmToFeet(+service.sgst || 0),
          initial_cgst: shouldDisableFields || isCabinetCategory ? '' : this.convertMmToFeet(+service.cgst || 0),
          initial_igst: shouldDisableFields || isCabinetCategory ? '' : this.convertMmToFeet(+service.igst || 0),
          shelves_count: service.shelves_count || '1',
          purchase_price: service.purchase_price || '0',
          al_profile: alProfile,
          multitop_profile: multitopProfile,
          plastic_clip: plasticClip,
          valleyht_profile: valleyhtProfile,
          shutter_area_other: shutterAreaOther
        });

        // Disable fields if needed
        if (shouldDisableFields || isCabinetCategory) {
          selectedRow.get('initial_sgst')?.disable();
          selectedRow.get('initial_cgst')?.disable();
          selectedRow.get('initial_igst')?.disable();
        } else {
          selectedRow.get('initial_sgst')?.enable();
          selectedRow.get('initial_cgst')?.enable();
          selectedRow.get('initial_igst')?.enable();
        }

        this.allFieldWorking(selectedRowIndex);

      } else {
        this.quotations_descriptions.push(
          this.formBuilder.group({
            service_name: serviceName,
            select_service: selectedService,
            item_name: serviceName,
            item_category: service.select_category,
            itemDescription: serviceDescription,
            hsn_code: logoUrl,
            unit_of_measurement: service.unit_of_measurement,
            rate: service.selling_price,
            initial_discount: currentDiscountValue,
            row_commission: currentrowcommission,
            initial_sgst: shouldDisableFields ? '' : this.convertMmToFeet(+service.sgst || 0),
            initial_cgst: shouldDisableFields ? '' : this.convertMmToFeet(+service.cgst || 0),
            initial_igst: shouldDisableFields ? '' : this.convertMmToFeet(+service.igst || 0),
            shelves_count: service.shelves_count || '1',
            purchase_price: service.purchase_price || '0',
            al_profile: alProfile,
            multitop_profile: multitopProfile,
            plastic_clip: plasticClip,
            valleyht_profile: valleyhtProfile,
            shutter_area_other: shutterAreaOther,
            isNewEntry: false,
            isDuplicated: false
          })
        );
      }
    },
    () => {
      this.toastr.error('Error fetching service details!');
    }
  );
}


  // To check if a service is already selected
  // To check if a service is already selected
  isServiceSelected(service: any): boolean {
    return this.selectedServices.some((selected) => selected.service_id === service.service_id);
  }
  calculateItemAmount(control: AbstractControl) {
    const quantity = parseFloat(control.get('quantity')?.value || '1');
    const rate = parseFloat(control.get('rate')?.value || '0');
    const initial_sgst = parseFloat(control.get('initial_sgst')?.value || '0');
    const initial_cgst = parseFloat(control.get('initial_cgst')?.value || '0');
    const initial_igst = parseFloat(control.get('initial_igst')?.value || '0');
    const area_shutter = parseFloat(control.get('area_shutter')?.value || '0');
    const shelves_count = parseFloat(control.get('shelves_count')?.value || '1'); // Using the correct shelves_count
    const purchase_price = parseFloat(control.get('purchase_price')?.value || '0'); // Using the correct purchase_price
    const free_item_amount = parseFloat(control.get('free_item_amount')?.value || '0');
    const al_profile = parseFloat(control.get('al_profile')?.value || '0');
    const multitop_profile = parseFloat(control.get('multitop_profile')?.value || '0');
    const plastic_clip = parseFloat(control.get('plastic_clip')?.value || '0');
    const valleyht_profile = parseFloat(control.get('valleyht_profile')?.value || '0');
    //commission
    const agentCommission = parseFloat(control.get('row_commission')?.value || '0');
    const originalRate = parseFloat(control.get('rate')?.value || '0');
    const originalPurchasePrice = parseFloat(control.get('purchase_price')?.value || '0'); //back panel
    const originalal_profilePrice = parseFloat(control.get('al_profile')?.value || '0');
    const originalmultitop_profilePrice = parseFloat(control.get('multitop_profile')?.value || '0');
    const originalplastic_clipPrice = parseFloat(control.get('plastic_clip')?.value || '0');
    const originalvalleyht_profilePrice = parseFloat(control.get('valleyht_profile')?.value || '0');

    const sgstInFeet = this.convertMmToFeet(initial_sgst); //width
    const cgstInFeet = this.convertMmToFeet(initial_cgst); //depth
    const igstInFeet = this.convertMmToFeet(initial_igst); //height

    const isCabinetCategory = control.get('item_category')?.value === 'CABINET'; // Assuming select_service decides category
    const shouldDisableFields = this.checkIfFieldsShouldBeDisabled(control); // Define this method as needed

    let finalAmount = 0;
    let newAmount = 0;
    let data = 0;

    let updatedRate = 0;
    let updatedal_profilePrice = 0;
    let updatedplastic_clipPrice = 0;
    let updatedmultitop_profilePrice = 0;
    let updatedvalleyht_profilePrice = 0;
    let updatedPurchasePrice = 0;



    // Calculate the commission amount for purchase price
    const commissionAmountForRate = (agentCommission / 100) * originalRate;
    updatedRate = originalRate + commissionAmountForRate;

    const commissionAmountForPurchasePrice = (agentCommission / 100) * originalPurchasePrice;
    updatedPurchasePrice = originalPurchasePrice + commissionAmountForPurchasePrice;

    const commissionAmountal_profilePrice = (agentCommission / 100) * originalal_profilePrice;
    updatedal_profilePrice = originalal_profilePrice + commissionAmountal_profilePrice;

    const commissionAmountFormultitop_profilePrice = (agentCommission / 100) * originalmultitop_profilePrice;
    updatedmultitop_profilePrice = originalmultitop_profilePrice + commissionAmountFormultitop_profilePrice;

    const commissionAmountForplastic_clipPrice = (agentCommission / 100) * originalplastic_clipPrice;
    updatedplastic_clipPrice = originalplastic_clipPrice + commissionAmountForplastic_clipPrice;

    const commissionAmountForvalleyht_profilePrice = (agentCommission / 100) * originalvalleyht_profilePrice;
    updatedvalleyht_profilePrice = originalvalleyht_profilePrice + commissionAmountForvalleyht_profilePrice;


    data =
      (
        (igstInFeet * cgstInFeet * 2 * updatedRate * quantity) +
        (sgstInFeet * cgstInFeet * shelves_count * updatedRate * quantity) +
        (sgstInFeet * igstInFeet * updatedPurchasePrice * quantity) +
        (updatedal_profilePrice * initial_sgst * quantity) +
        (updatedvalleyht_profilePrice * initial_sgst * quantity) +
        (updatedmultitop_profilePrice * initial_sgst * 2 * quantity) +
        (updatedplastic_clipPrice * quantity)
      );
    let SHUTTERDATA = this.calculateTotalShutterData(); // Calculate SHUTTERDATA for the current row

    // Display SHUTTERDATA in the 'area_shutter' field for the current row
    control.get('area_shutter')?.setValue(SHUTTERDATA, { emitEvent: false });

    const selectedCategory = control.get('item_category')?.value;
    if (shouldDisableFields || selectedCategory === 'OTHERS') {
      // Calculate for "Others" where fields are disabled
      finalAmount = quantity * updatedRate;
    } else if (isCabinetCategory) {
      // Calculate for "Cabinet"
      const safeTotalShutterArea = this.totalShutterArea || 0;
      if (selectedCategory === 'OTHER-CABINET') {
        finalAmount = quantity * updatedRate;
      }
      else if (selectedCategory === 'FREE-ITEM') {
        finalAmount = free_item_amount;
      }
      else if (selectedCategory === 'SHUTTER') {
        finalAmount = updatedRate * quantity * safeTotalShutterArea; // If category is 'SHUTTER'
      } else {
        finalAmount = data; // For other categories
      }
    } else {
      // General case
      const safeTotalShutterArea = this.totalShutterArea || 0;
      control.get('safeTotalShutterArea')?.setValue(safeTotalShutterArea);

      if (shouldDisableFields || selectedCategory === 'OTHERS') {
        // Calculate for "Others" where fields are disabled
        finalAmount = quantity * updatedRate;
      } else if (selectedCategory === 'OTHER-CABINET') {
        finalAmount = quantity * updatedRate;
      }
      else if (selectedCategory === 'FREE-ITEM') {
        finalAmount = free_item_amount;
      }
      else if (selectedCategory === 'SHUTTER') {
        finalAmount = updatedRate * quantity * safeTotalShutterArea; // If category is 'SHUTTER'
      } else {
        finalAmount = data; // For other categories
      }
    }

    // Set the calculated amount
    control.get('amount')?.setValue(finalAmount.toFixed(2), { emitEvent: false });

    // Recalculate and update totals
    this.calculateTotalsnew();
    this.calculateGrandTotal();
    this.calculateTotalShutterData();
  }

  duplicateRow(event: Event, index: number): void {
    event.preventDefault(); // Prevents the form from submitting
    const currentDiscountValue = this.customerForm.get('amount_show_hide')?.value || '';
    const currentrowcommission = this.customerForm.get('agent_commission')?.value || '';
    // Get the current row's form data
    const currentRow = this.quotations_descriptions.at(index).value;

    // Create a new form group with the same values as the current row
    const duplicatedRow = this.formBuilder.group({
      select_service: [currentRow.select_service],
      item_name: [currentRow.item_name],
      item_category: [currentRow.item_category],
      itemDescription: [currentRow.itemDescription],
      hsn_code: [currentRow.hsn_code],
      unit_of_measurement: [currentRow.unit_of_measurement],
      rate: [currentRow.rate],
      quantity: [currentRow.quantity],
      initial_discount: [currentDiscountValue],
      row_commission: this.customerForm.get('agent_commission')?.value || '0',
      initial_sgst: [currentRow.initial_sgst],
      initial_cgst: [currentRow.initial_cgst],
      initial_igst: [currentRow.initial_igst],
      agent_commission: [currentRow.agent_commission],
      amount: [this.calculateAmount(currentRow)], // Make sure to calculate amount here
      free_item_amount: [currentRow.free_item_amount],
      purchase_price: [currentRow.purchase_price],
      shelves_count: [currentRow.shelves_count],
      al_profile: [currentRow.al_profile],
      multitop_profile: [currentRow.multitop_profile],
      plastic_clip: [currentRow.plastic_clip],
      valleyht_profile: [currentRow.valleyht_profile],
      area_shutter: [currentRow.area_shutter],
      add_extra_area: [currentRow.add_extra_area],
      shutter_area_other: [currentRow.shutter_area_other],
      free_item_desc: [currentRow.free_item_desc],
      isDuplicated: [true] // Add flag to indicate this row is a duplicate
    });

    // Insert the duplicated row at the next index
    this.quotations_descriptions.insert(index + 1, duplicatedRow);

    // Optionally call methods to handle the new row's value changes
    this.allFieldWorking(index + 1); // New row's index is index + 1

    // Recalculate all dependent fields and totals
    this.calculateDependentFields();
    this.calculateSpecialDiscount();
    this.calculateTotalsnew();
    this.calculateGrandTotal();

    // Update the form array and parent form's validity
    this.quotations_descriptions.updateValueAndValidity();
    this.customerForm.updateValueAndValidity();
  }

  subscribeToValueChangess() {
    this.quotations_descriptions.controls.forEach((control: AbstractControl, index: number) => {
      // When quantity changes
      control.get('quantity')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });
      control.get('row_commission')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });
      // When rate changes
      control.get('rate')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });

      // When initial_sgst changes
      control.get('initial_sgst')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });
      control.get('unit_of_measurement')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });
      // When initial_cgst changes
      control.get('initial_cgst')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });
      control.get('free_item_amount')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });
      // When initial_igst changes
      control.get('initial_igst')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });

      // When shutter_area_other changes
      control.get('shutter_area_other')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });

      // When area_shutter changes
      control.get('area_shutter')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });

      control.get('add_extra_area')?.valueChanges.subscribe(() => {
        this.allFieldWorking(index);
      });
    });
  }

  addHsnCodeControl(hsnCode: string): void {
    this.quotations_descriptions.push(this.formBuilder.control(hsnCode));
  }
  addServiceDescriptionControl(serviceDescription: string): void {
    this.quotations_descriptions.push(this.formBuilder.control(serviceDescription));
  }

  displayItemDescription(option: string): string {
    return option;
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void { }
  fetchNextQuotationId(): void {
    this.quotationService.getNewQuotationId().subscribe(
      (data: any) => {
        const nextQuotationId = data.quotation_id;

        this.nextQuotationId = nextQuotationId;
      },
      (error) => { }
    );
  }

  subscribeToQuantityChanges() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('quantity')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }
  subscribeToRowCommissinChanges() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('row_commission')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }
  subscribeToRateChanges() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('rate')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }

  subscribeToDiscount_Changes() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('initial_discount')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }
  subscribeToIGST_Changes() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('initial_sgst')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }
  subscribeToCGST_Changes() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('initial_cgst')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }
  subscribeTofree_item_amountChanges() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('free_item_amount')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }
  subscribeToSGST_Changes() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('initial_igst')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }

  subscribeToarea_shutter_Changes() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('area_shutter')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }

  subscribeToadd_extra_area_Changes() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('add_extra_area')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }
  subscribeToshutter_area_other_Changes() {
    this.quotations_descriptions.controls.forEach((control, index) => {
      control.get('shutter_area_other')?.valueChanges.subscribe(() => {
        this.updateTotalValues();
      });
    });
  }

  updateTotalValues() {
    this.calculateTotals();
    this.calculateGrandTotal();
  }

  selectedStateId: number | undefined;

  onSelectCustomer(selectedCustomer: any): void {
    this.isLoading = true;
    this.customerService.getCustomerById(selectedCustomer.id).subscribe(
      (response: any) => {

        if (response.data && response.data.length > 0) {
          const customerData = response.data[0];
          this.customerForm.patchValue({
            select_customer: selectedCustomer,
            business_name: customerData.business_name,
            // agent_commission: customerData.agent_commission,
            customer_name: customerData.name,
            contact_person: customerData.contact_person,
            contact_number: customerData.owner_mobile,
            state: customerData.state,
            select_city: customerData.select_city,
            consignee_address: customerData.address,
            reference: customerData.contact_person,
            email: customerData.email,
            gstin_no: customerData.gst_in
          });

          this.selectedStateId = customerData.select_state;
          this.isLoading = false;
          this.cdr.detectChanges();
          // this.customerForm.get('select_customer')?.disable();
        } else {
          this.isLoading = false;
        }
      },
      (error: any) => { this.isLoading = true; }
    );
  }
  compareCustomers(customer1: any, customer2: any): boolean {
    return customer1 && customer2 ? customer1.id === customer2.id : customer1 === customer2;
  }

  subscribeToTotalAmountChanges() {
    this.customerForm.get('total_amount')?.valueChanges.subscribe(() => {
      this.calculateDependentFields();
      this.calculateSpecialDiscount();
      this.calculateGrandTotal();
    });
  }

  calculateDependentFields() {
    const totalAmount = parseFloat(this.customerForm.get('total_amount')?.value || '0');
    const discount = parseFloat(this.customerForm.get('discount')?.value || '0');
    const igst = parseFloat(this.customerForm.get('IGST')?.value || '0');
    const sgst = parseFloat(this.customerForm.get('sgst')?.value || '0');
    const cgst = parseFloat(this.customerForm.get('cgst')?.value || '0');

    const discountedAmount = (discount / 100) * totalAmount;
    const igstAmount = (igst / 100) * totalAmount;
    const sgstAmount = (sgst / 100) * totalAmount;
    const cgstAmount = (cgst / 100) * totalAmount;

    this.customerForm.get('discountedAmount')?.setValue(discountedAmount.toFixed(2));
    this.customerForm.get('igstAmount')?.setValue(igstAmount.toFixed(2));
    this.customerForm.get('sgstAmount')?.setValue(sgstAmount.toFixed(2));
    this.customerForm.get('cgstAmount')?.setValue(cgstAmount.toFixed(2));
  }

  //--------------------- special discount start---------------------------
  subscribeToValueChanges() {
    this.customerForm.get('discount')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });

    this.customerForm.get('IGST')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });

    this.customerForm.get('sgst')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });

    this.customerForm.get('cgst')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });

    this.customerForm.get('transport')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });


  }

  calculateGrandTotal(): void {
    const totalAmount = parseFloat(this.customerForm.get('total_amount')?.value || '0');

    // const igstAmount = parseFloat(this.customerForm.get('igstAmount')?.value || '0');
    // const sgstAmount = parseFloat(this.customerForm.get('sgstAmount')?.value || '0');
    // const cgstAmount = parseFloat(this.customerForm.get('cgstAmount')?.value || '0');
    const transport = parseFloat(this.customerForm.get('transport')?.value || '0');
    const otherCharges = parseFloat(this.customerForm.get('other_charges')?.value || '0');
    const specialDiscountTotal = parseFloat(this.customerForm.get('special_discount_total')?.value || '0');

    // Calculate grand total including special discount
    const grandTotalbeforeGst = totalAmount - specialDiscountTotal;

    const gstCalculate = (grandTotalbeforeGst * (transport / 100));
    const grandTotal = (grandTotalbeforeGst * (transport + 100) / 100);

    // Update the grand total
    this.customerForm.get('grand_total')?.setValue(grandTotal.toFixed(2));

    // Update the grand total in words
    const grandTotalWords = this.numberToWords(grandTotal);
    this.customerForm.get('grand_total_in_words')?.setValue(grandTotalWords);
    this.customerForm.get('discounted_total_amount_display')?.setValue(grandTotalbeforeGst.toFixed(2));

    this.customerForm.get('other_charges')?.setValue(gstCalculate.toFixed(2));
    const integrated_amount = totalAmount;
    this.customerForm.get('integrated_amount')?.setValue(integrated_amount.toFixed(2));



  }



  onSubmit(): void {

    this.customerForm.get('discountedAmount')?.enable();
    this.customerForm.get('cgstAmount')?.enable();
    this.customerForm.get('igstAmount')?.enable();
    this.customerForm.get('grand_total')?.enable();
    this.customerForm.get('sgstAmount')?.enable();
    // this.customerForm.get('copy_remark')?.setValue(null);
    // this.customerForm.get('is_coppied')?.setValue(null);
    this.quotations_descriptions.controls.forEach((control) => {
      const amount = this.calculateAmount(control.value);
      control.get('amount')?.setValue(amount.toFixed(2));

      // Ensure select_service is properly set for all descriptions
      if (!control.get('select_service')?.value) {
        control.get('select_service')?.setValue(this.customerForm.get('select_service')?.value);
      }
    });

    if (this.customerForm.valid) {
      this.isSendingEmail = true;
      this.isLoading = true;
      const quotationData = this.customerForm.value;
      quotationData.remark = quotationData.remark.replace(/\n/g, '<br>');
      quotationData.quotations_descriptions = this.quotations_descriptions.value;



      quotationData.quotations_descriptions.forEach((description: any) => {
        description.select_service = JSON.stringify(description.select_service);
        if (!description.item_name) {
          description.item_name = description.service_name || 'Default Item'; // Assign a default or other meaningful value
        }
        if (!description.item_category) {
          description.item_category = description.select_category || 'Default Item'; // Assign a default or other meaningful value
        }
        if (description.itemDescription && Array.isArray(description.itemDescription)) {
          description.itemDescription = description.itemDescription.join(', ');
        }
        description.total_quantity = this.customerForm.get('total_quantity')?.value;
        description.total_rate = this.customerForm.get('total_rate')?.value;
        description.total_amount = this.customerForm.get('total_amount')?.value;
        description.discountedAmount = this.customerForm.get('discountedAmount')?.value;
        description.igstAmount = this.customerForm.get('igstAmount')?.value;
        description.cgstAmount = this.customerForm.get('cgstAmount')?.value;
        description.sgstAmount = this.customerForm.get('sgstAmount')?.value;
        description.grand_total = this.customerForm.get('grand_total')?.value;
        description.grand_total_in_words = this.customerForm.get('grand_total_in_words')?.value;
        description.transport = this.customerForm.get('transport')?.value;

        // Include sgst, igst, discount, and amount fields
        description.sgst = this.customerForm.get('sgst')?.value;
        description.igst = this.customerForm.get('IGST')?.value;
        description.cgst = this.customerForm.get('cgst')?.value;
        description.discount = this.customerForm.get('discount')?.value;
      });

      if (this.editingMode) {
        if (this.selectedQuotation) {
          if (this.isServiceTableSelected) {
            this.updateQuotation(this.selectedQuotation.quotation_id, quotationData);
          }

        }
      } else {
        if (this.isServiceTableSelected) {
          this.createQuotation(quotationData);
        }

      }
    } else {
      this.isLoading = false;
      this.toastr.error('Form is invalid');
    }
  }

  createQuotation(quotationData: any): void {
    const userData = this.customerForm.value;
    userData.loginserquot_id = this.loginUserId;
    userData.login_company = this.myCompany;
    userData.loginUserName = this.loginUserName;
    userData.role = this.loginUserRole;
    // Stringify select_customer if necessary
    const selectedCustomerString = JSON.stringify(userData.select_customer);
    // Manually set validity of quotations_descriptions to VALID
    this.customerForm.get('quotations_descriptions')?.setErrors(null);
    // image upload
    if (this.selectedLogos.length > 0) {
      const formData = new FormData();
      const formArray = this.customerForm.get('companyLogoOne') as FormArray;

      // Append each image file data to FormData
      formArray.controls.forEach((control, index) => {
        formData.append(`companyLogoOne_${index}`, control.value);
      });

      // Send formData via HTTP request
      // this.yourService.submitFormData(formData).subscribe(response => { /* handle response */ });
    }
    // Ensure select_service is properly set for each description
    const descriptions = this.quotations_descriptions.value.map((desc: any) => {
      // Ensure to preserve select_service for existing rows
      if (desc.select_service && typeof desc.select_service === 'object') {
        return {
          ...desc,
          select_service: JSON.stringify(desc.select_service), // Stringify for new rows only
          service_name: desc.select_service.service_name
        };
      }
      return desc; // Existing rows should remain unchanged
    });

    // Create formData with adjusted descriptions
    const formData = {
      ...userData,
      select_customer: selectedCustomerString,
      quotations_descriptions: descriptions // Include descriptions with adjusted select_service
    };

    this.quotationService.createQuotation(formData).subscribe(
      (response: any) => {
        this.toastr.success('Quotation added successfully!');
        this.router.navigate(['/quotation/list']);
        this.isSendingEmail = false;
        this.isLoading = false;
        this.quotationService.notifyCategoryAdded();
      },
      (error: any) => {
        this.toastr.error('Error adding Quotation!');
        this.isSendingEmail = false;
        this.isLoading = false;
      }
    );
  }

  updateQuotation(quotationId: number, quotationData: any): void {
    let aa = this.customerForm.get('select_customer')?.value;
    if (this.selectedLogos.length > 0) {
      const formData = new FormData();
      const formArray = this.customerForm.get('companyLogoOne') as FormArray;

      // Append each image file data to FormData
      formArray.controls.forEach((control, index) => {
        formData.append(`companyLogoOne_${index}`, control.value);
      });

      // Send formData via HTTP request
      // this.yourService.submitFormData(formData).subscribe(response => { /* handle response */ });
    }
    const updatedDescriptions = this.quotations_descriptions.value.map((desc: any) => {
      // Ensure to preserve select_service for existing rows
      if (desc.select_service && typeof desc.select_service === 'object') {
        return {
          ...desc,
          select_service: JSON.stringify(desc.select_service) // Stringify for new rows only
        };
      }
      return desc; // Existing rows should remain unchanged
    });

    const updatedQuotationData = {
      ...this.customerForm.value,
      quotations_descriptions: updatedDescriptions, // Ensure updatedDescriptions has correct select_service values
      select_customer: JSON.stringify(aa)
    };

    this.quotationService.updateQuotation(quotationId, updatedQuotationData).subscribe(
      (data: any) => {
        this.toastr.success('Quotation updated successfully!');
        this.router.navigate(['/quotation/list']);
        this.isSendingEmail = false;
        this.quotationService.notifyCategoryAdded();
        this.isLoading = false;
      },
      (error: any) => {
        this.toastr.error('Error updating Quotation!');
        this.isSendingEmail = false;
        this.isLoading = false;
      }
    );
  }


  // ------------------------------table-------------------------------------------
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  addItem() {
    const currentDiscountValue = this.customerForm.get('amount_show_hide')?.value || ''; // Capture the current value
    const currentrow_commission = this.customerForm.get('agent_commission')?.value || '';
    const descriptionGroup = this.formBuilder.group({
      select_service: [''],
      service_name: [''],
      select_category:[''],
      item_name: [''],
      item_category: [''],
      itemDescription: [''],
      hsn_code: [''],
      unit_of_measurement: [''],
      quantity: ['1'],
      rate: [''],
      initial_discount: [currentDiscountValue],
      initial_sgst: [''],
      initial_cgst: [''],
      initial_igst: [''],
      amount: [''],
      free_item_amount: [''],
      purchase_price: [''], // Adding purchase_price field
      shelves_count: ['1'], // Adding shelves_count field (default to 1)
      al_profile: [''],
      multitop_profile: [''],
      plastic_clip: [''],
      valleyht_profile: [''],
      area_shutter: [''],
      shutter_area_other: [''],
      add_extra_area: ['0'],
      safeTotalShutterArea: [''],
      free_item_desc: [''],
      row_commission: [currentrow_commission],
      isNewEntry: [true]
    });

    descriptionGroup.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('amount')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('purchase_price')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('shelves_count')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('row_commission')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('al_profile')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('multitop_profile')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('plastic_clip')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('valleyht_profile')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('shutter_area_other')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    descriptionGroup.get('rate')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });

    descriptionGroup.get('initial_discount')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });

    descriptionGroup.get('initial_sgst')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });

    descriptionGroup.get('initial_cgst')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });

    descriptionGroup.get('free_item_amount')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });

    descriptionGroup.get('initial_igst')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });

    descriptionGroup.get('add_extra_area')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });

    descriptionGroup.get('area_shutter')?.valueChanges.subscribe(() => {
      this.calculateItemAmount(descriptionGroup);
    });
    this.quotations_descriptions.push(descriptionGroup);
    this.dataSource.data = this.quotations_descriptions.value;
  }

  checkIfFieldsShouldBeDisabled(control: AbstractControl): boolean {
    // Implement your logic to determine if fields should be disabled
    return control.get('item_category')?.value === 'OTHERS'; // Example condition
  }



  allFieldWorking(index: number) {
    const control = this.quotations_descriptions.at(index);

    const quantity = parseFloat(control.get('quantity')?.value || '1');
    const rate = parseFloat(control.get('rate')?.value || '0');
    const initial_sgst = parseFloat(control.get('initial_sgst')?.value || '0');
    const initial_cgst = parseFloat(control.get('initial_cgst')?.value || '0');
    const initial_igst = parseFloat(control.get('initial_igst')?.value || '0');

    const area_shutter = parseFloat(control.get('area_shutter')?.value || '0');
    const shelves_count = parseFloat(control.get('shelves_count')?.value || '1'); // Using the correct shelves_count
    const purchase_price = parseFloat(control.get('purchase_price')?.value || '0'); // Using the correct purchase_price

    const al_profile = parseFloat(control.get('al_profile')?.value || '0');
    const multitop_profile = parseFloat(control.get('multitop_profile')?.value || '0');
    const plastic_clip = parseFloat(control.get('plastic_clip')?.value || '0');
    const valleyht_profile = parseFloat(control.get('valleyht_profile')?.value || '0');

    const shutter_area_other = parseFloat(control.get('shutter_area_other')?.value || '0');
    const selectedCategory = control.get('item_category')?.value;
    const free_item_amount = parseFloat(control.get('free_item_amount')?.value || '0');

    //commission
    const agentCommission = parseFloat(control.get('row_commission')?.value || '0');
    const originalRate = parseFloat(control.get('rate')?.value || '0');
    const originalPurchasePrice = parseFloat(control.get('purchase_price')?.value || '0'); //back panel
    const originalal_profilePrice = parseFloat(control.get('al_profile')?.value || '0');
    const originalmultitop_profilePrice = parseFloat(control.get('multitop_profile')?.value || '0');
    const originalplastic_clipPrice = parseFloat(control.get('plastic_clip')?.value || '0');
    const originalvalleyht_profilePrice = parseFloat(control.get('valleyht_profile')?.value || '0');
    const originalshutter_area_otherPrice = parseFloat(control.get('shutter_area_other')?.value || '0');
    const isCabinetCategory = control.get('item_category')?.value === 'CABINET';
    const shouldDisableFields =
      control.get('initial_sgst')?.disabled || control.get('initial_cgst')?.disabled || control.get('initial_igst')?.disabled;


    let amount = 0;
    let aaaa = 0;
    let data = 0;

    let updatedRate = 0;
    let updatedal_profilePrice = 0;
    let updatedplastic_clipPrice = 0;
    let updatedmultitop_profilePrice = 0;
    let updatedvalleyht_profilePrice = 0;
    let updatedPurchasePrice = 0;


    // Calculate the commission amount for purchase price
    const commissionAmountForRate = (agentCommission / 100) * originalRate;
    updatedRate = originalRate + commissionAmountForRate;

    const commissionAmountForPurchasePrice = (agentCommission / 100) * originalPurchasePrice;
    updatedPurchasePrice = originalPurchasePrice + commissionAmountForPurchasePrice;

    const commissionAmountal_profilePrice = (agentCommission / 100) * originalal_profilePrice;
    updatedal_profilePrice = originalal_profilePrice + commissionAmountal_profilePrice;

    const commissionAmountFormultitop_profilePrice = (agentCommission / 100) * originalmultitop_profilePrice;
    updatedmultitop_profilePrice = originalmultitop_profilePrice + commissionAmountFormultitop_profilePrice;

    const commissionAmountForplastic_clipPrice = (agentCommission / 100) * originalplastic_clipPrice;
    updatedplastic_clipPrice = originalplastic_clipPrice + commissionAmountForplastic_clipPrice;

    const commissionAmountForvalleyht_profilePrice = (agentCommission / 100) * originalvalleyht_profilePrice;
    updatedvalleyht_profilePrice = originalvalleyht_profilePrice + commissionAmountForvalleyht_profilePrice;

    if (shouldDisableFields || selectedCategory === 'OTHERS') {
      // Calculate for "Others" where fields are disabled
      amount = quantity * updatedRate;
    } else if (isCabinetCategory) {
      // Calculate for "Cabinet"

      const sgstInFeet = this.convertMmToFeet(initial_sgst); //width
      const cgstInFeet = this.convertMmToFeet(initial_cgst); //depth
      const igstInFeet = this.convertMmToFeet(initial_igst); //height
      let SHUTTERDATA = this.calculateTotalShutterData();  // Calculate SHUTTERDATA for the current row

      // Display SHUTTERDATA in the 'area_shutter' field for the current row
      control.get('area_shutter')?.setValue(SHUTTERDATA, { emitEvent: false });
      data =
        (
          (igstInFeet * cgstInFeet * 2 * updatedRate * quantity) +
          (sgstInFeet * cgstInFeet * shelves_count * updatedRate * quantity) +
          (sgstInFeet * igstInFeet * updatedPurchasePrice * quantity) +
          (updatedal_profilePrice * initial_sgst * quantity) +
          (updatedvalleyht_profilePrice * initial_sgst * quantity) +
          (updatedmultitop_profilePrice * initial_sgst * 2 * quantity) +
          (updatedplastic_clipPrice * quantity)
        );
      const safeTotalShutterArea = this.totalShutterArea || 0;
      control.get('safeTotalShutterArea')?.setValue(safeTotalShutterArea);
      // Conditional assignment for amount
      if (selectedCategory === 'OTHER-CABINET') {
        amount = quantity * updatedRate;
      } else if (selectedCategory === 'FREE-ITEM') {
        amount = free_item_amount;
      }

      else if (selectedCategory === 'SHUTTER') {
        amount = updatedRate * quantity * safeTotalShutterArea; // If category is 'SHUTTER'
      } else {
        amount = data + 0; // For other categories
      }
    } else {
      const sgstInFeet = this.convertMmToFeet(initial_sgst); //width
      const cgstInFeet = this.convertMmToFeet(initial_cgst); //depth
      const igstInFeet = this.convertMmToFeet(initial_igst); //height
      let SHUTTERDATA = sgstInFeet * igstInFeet; // Calculate SHUTTERDATA for the current row

      // Display SHUTTERDATA in the 'area_shutter' field for the current row
      control.get('area_shutter')?.setValue(SHUTTERDATA.toFixed(2), { emitEvent: false });
      data =
        (
          (igstInFeet * cgstInFeet * 2 * updatedRate * quantity) +
          (sgstInFeet * cgstInFeet * shelves_count * updatedRate * quantity) +
          (sgstInFeet * igstInFeet * updatedPurchasePrice * quantity) +
          (updatedal_profilePrice * initial_sgst * quantity) +
          (updatedvalleyht_profilePrice * initial_sgst * quantity) +
          (updatedmultitop_profilePrice * initial_sgst * 2 * quantity) +
          (updatedplastic_clipPrice * quantity)
        );
      const safeTotalShutterArea = this.totalShutterArea || 0;
      control.get('safeTotalShutterArea')?.setValue(safeTotalShutterArea);

      // Conditional assignment for amount
      if (shouldDisableFields || selectedCategory === 'OTHERS') {
        // Calculate for "Others" where fields are disabled
        amount = quantity * updatedRate;
      } else if (selectedCategory === 'OTHER-CABINET') {
        amount = quantity * updatedRate;
      }
      else if (selectedCategory === 'FREE-ITEM') {
        amount = free_item_amount;
      }

      else if (selectedCategory === 'SHUTTER') {
        amount = updatedRate * quantity * safeTotalShutterArea; // If category is 'SHUTTER'
      } else {
        amount = data + 0; // For other categories
      }
    }

    // Set the calculated amount
    control.get('amount')?.setValue(amount.toFixed(2), { emitEvent: false });

    // Recalculate totals
    this.calculateTotals();
    this.calculateTotalShutterData();
    this.calculateTotalsnew();
    this.calculateGrandTotal(); // If applicable for grand totals or other fields
  }
  calculateTotalsnew(): void {
    let totalAmount = 0;
    let totalQuantity = 0;

    this.quotations_descriptions.controls.forEach((control: AbstractControl) => {
      const amount = parseFloat(control.get('amount')?.value || '0');
      const quantity = parseFloat(control.get('quantity')?.value || '0');

      totalAmount += amount;
      totalQuantity += quantity;
    });

    this.customerForm.get('total_quantity')?.setValue(totalQuantity.toFixed(2));
    this.customerForm.get('total_amount')?.setValue(totalAmount.toFixed(2), { emitEvent: false });

    this.calculateSpecialDiscount();
  }

  calculateTotals() {
    let totalQuantity = 0;
    let totalRate = 0;
    let totalAmount = 0;

    let updatedRate = 0;
    let updatedal_profilePrice = 0;
    let updatedplastic_clipPrice = 0;
    let updatedmultitop_profilePrice = 0;
    let updatedvalleyht_profilePrice = 0;
    let updatedPurchasePrice = 0;

    this.quotations_descriptions.controls.forEach((control) => {
      const rate = parseFloat(control.get('rate')?.value || '0');
      const quantity = parseFloat(control.get('quantity')?.value || '0');
      const special_discount = parseFloat(control.get('special_discount')?.value || '0');
      const initial_sgst = parseFloat(control.get('initial_sgst')?.value || '0');
      const initial_cgst = parseFloat(control.get('initial_cgst')?.value || '0');
      const initial_igst = parseFloat(control.get('initial_igst')?.value || '0');
      const purchase_price = parseFloat(control.get('purchase_price')?.value || '0');
      const shelves_count = parseFloat(control.get('shelves_count')?.value || '0');
      const al_profile = parseFloat(control.get('al_profile')?.value || '0');
      const multitop_profile = parseFloat(control.get('multitop_profile')?.value || '0');
      const plastic_clip = parseFloat(control.get('plastic_clip')?.value || '0');
      const valleyht_profile = parseFloat(control.get('valleyht_profile')?.value || '0');
      const shutter_area_other = parseFloat(control.get('shutter_area_other')?.value || '0');
      const free_item_amount = parseFloat(control.get('free_item_amount')?.value || '0');

      //commission
      const agentCommission = parseFloat(control.get('row_commission')?.value || '0');
      const originalRate = parseFloat(control.get('rate')?.value || '0');
      const originalPurchasePrice = parseFloat(control.get('purchase_price')?.value || '0'); //back panel
      const originalal_profilePrice = parseFloat(control.get('al_profile')?.value || '0');
      const originalmultitop_profilePrice = parseFloat(control.get('multitop_profile')?.value || '0');
      const originalplastic_clipPrice = parseFloat(control.get('plastic_clip')?.value || '0');
      const originalvalleyht_profilePrice = parseFloat(control.get('valleyht_profile')?.value || '0');
      const originalshutter_area_otherPrice = parseFloat(control.get('shutter_area_other')?.value || '0');


      const sgstInFeet = this.convertMmToFeet(initial_sgst);
      const cgstInFeet = this.convertMmToFeet(initial_cgst);
      const igstInFeet = this.convertMmToFeet(initial_igst);

      // Calculate the commission amount for purchase price
      const commissionAmountForRate = (agentCommission / 100) * originalRate;
      updatedRate = originalRate + commissionAmountForRate;

      const commissionAmountForPurchasePrice = (agentCommission / 100) * originalPurchasePrice;
      updatedPurchasePrice = originalPurchasePrice + commissionAmountForPurchasePrice;

      const commissionAmountal_profilePrice = (agentCommission / 100) * originalal_profilePrice;
      updatedal_profilePrice = originalal_profilePrice + commissionAmountal_profilePrice;

      const commissionAmountFormultitop_profilePrice = (agentCommission / 100) * originalmultitop_profilePrice;
      updatedmultitop_profilePrice = originalmultitop_profilePrice + commissionAmountFormultitop_profilePrice;

      const commissionAmountForplastic_clipPrice = (agentCommission / 100) * originalplastic_clipPrice;
      updatedplastic_clipPrice = originalplastic_clipPrice + commissionAmountForplastic_clipPrice;

      const commissionAmountForvalleyht_profilePrice = (agentCommission / 100) * originalvalleyht_profilePrice;
      updatedvalleyht_profilePrice = originalvalleyht_profilePrice + commissionAmountForvalleyht_profilePrice;


      let SHUTTERDATA = this.calculateTotalShutterData(); // Calculate SHUTTERDATA for the current row
      const selectedCategory = control.get('item_category')?.value;

      // Display SHUTTERDATA in the 'area_shutter' field for the current row
      control.get('area_shutter')?.setValue(SHUTTERDATA, { emitEvent: false });

      // Check category and field status
      const isCabinetCategory = control.get('item_category')?.value === 'CABINET';
      const shouldDisableFields =
        control.get('initial_sgst')?.disabled || control.get('initial_cgst')?.disabled || control.get('initial_igst')?.disabled;

      let amount = 0;
      let additionalAmount = 0;
      let data = 0;
      if (shouldDisableFields || selectedCategory === 'OTHERS') {
        // Calculate for "Others" when fields are disabled
        amount = quantity * updatedRate;
      } else if (isCabinetCategory) {
        // Calculate for "Cabinet"

        data =
          (
            (igstInFeet * cgstInFeet * 2 * updatedRate * quantity) +
            (sgstInFeet * cgstInFeet * shelves_count * updatedRate * quantity) +
            (sgstInFeet * igstInFeet * updatedPurchasePrice * quantity) +
            (updatedal_profilePrice * initial_sgst * quantity) +
            (updatedvalleyht_profilePrice * initial_sgst * quantity) +
            (updatedmultitop_profilePrice * initial_sgst * 2 * quantity) +
            (updatedplastic_clipPrice * quantity)
          );

        const safeTotalShutterArea = this.totalShutterArea || 0;
        control.get('safeTotalShutterArea')?.setValue(safeTotalShutterArea);
        // Conditional assignment for amount
        if (selectedCategory === 'OTHER-CABINET') {
          amount = quantity * updatedRate;
        }
        else if (selectedCategory === 'FREE-ITEM') {
          amount = free_item_amount;
        }
        else if (selectedCategory === 'SHUTTER') {
          amount = updatedRate * quantity * safeTotalShutterArea; // If category is 'SHUTTER'
        } else {
          amount = data + 0; // For other categories
        }
      } else {
        data =
          (
            (igstInFeet * cgstInFeet * 2 * updatedRate * quantity) +
            (sgstInFeet * cgstInFeet * shelves_count * updatedRate * quantity) +
            (sgstInFeet * igstInFeet * updatedPurchasePrice * quantity) +
            (updatedal_profilePrice * initial_sgst * quantity) +
            (updatedvalleyht_profilePrice * initial_sgst * quantity) +
            (updatedmultitop_profilePrice * initial_sgst * 2 * quantity) +
            (updatedplastic_clipPrice * quantity)
          );
        const safeTotalShutterArea = this.totalShutterArea || 0;
        control.get('safeTotalShutterArea')?.setValue(safeTotalShutterArea);

        if (shouldDisableFields || selectedCategory === 'OTHERS') {
          // Calculate for "Others" where fields are disabled
          amount = quantity * updatedRate;
        } else if (selectedCategory === 'OTHER-CABINET') {
          amount = quantity * updatedRate;
        }
        else if (selectedCategory === 'FREE-ITEM') {
          amount = free_item_amount;
        }
        else if (selectedCategory === 'SHUTTER') {
          amount = updatedRate * quantity * safeTotalShutterArea; // If category is 'SHUTTER'
        } else {
          amount = data + 0; // For other categories
        }
      }

      // Apply discount if available
      const discountedAmount = amount - amount * (special_discount / 100);

      // Update totals
      totalQuantity += quantity;
      totalRate += rate;
      totalAmount += discountedAmount;
      control.get('amount')?.setValue(discountedAmount.toFixed(2), { emitEvent: true }); // Set emitEvent to true to update UI
    });

    // Set total values in the form
    this.customerForm.get('total_quantity')?.setValue(totalQuantity.toFixed(2));
    this.customerForm.get('total_rate')?.setValue(totalRate.toFixed(2));
    this.customerForm.get('total_amount')?.setValue(totalAmount.toFixed(2));

    // Recalculate grand total and other fields if necessary
    this.calculateGrandTotal();
    this.calculateTotalShutterData();
  }

  getQuantityControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('quantity') as FormControl;
  }

  getinitial_discountControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('initial_discount') as FormControl;
  }

  getinitial_sgstControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('initial_sgst') as FormControl;
  }

  getinitial_cgstControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('initial_cgst') as FormControl;
  }
  getfree_item_amountControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('free_item_amount') as FormControl;
  }
  getinitial_igstControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('initial_igst') as FormControl;
  }

  getarea_shutterControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('area_shutter') as FormControl;
  }

  getadd_extra_areaControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('add_extra_area') as FormControl;
  }

  getRateControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('rate') as FormControl;
  }
  getpurchase_priceControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('purchase_price') as FormControl;
  }
  getshelves_countControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('shelves_count') as FormControl;
  }
  getal_profileControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('al_profile') as FormControl;
  }

  getmultitop_profileControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('multitop_profile') as FormControl;
  }
  getplastic_clipControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('plastic_clip') as FormControl;
  }

  getvalleyht_profileControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('valleyht_profile') as FormControl;
  }

  getshutter_area_otherControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('shutter_area_other') as FormControl;
  }

  getCategoryControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('item_category') as FormControl;
  }

  getRowCommissionControl(element: PeriodicElement): FormControl {
    return this.customerForm
      .get('quotations_descriptions')
      ?.get([this.dataSource.data.indexOf(element)])
      ?.get('row_commission') as FormControl;
  }

  calculateAmount(element: PeriodicElement): number {
    const quantity = this.getQuantityControl(element)?.value || 0;
    const rate = this.getRateControl(element)?.value || 0;
    const initial_discount = this.getinitial_discountControl(element)?.value || 0;
    const initial_sgst = this.getinitial_sgstControl(element)?.value || 0;
    const initial_cgst = this.getinitial_cgstControl(element)?.value || 0;
    const initial_igst = this.getinitial_igstControl(element)?.value || 0;

    const purchase_price = this.getpurchase_priceControl(element)?.value || 0;
    const shelves_count = this.getshelves_countControl(element)?.value || 0;
    const al_profile = this.getal_profileControl(element)?.value || 0;
    const multitop_profile = this.getmultitop_profileControl(element)?.value || 0;
    const plastic_clip = this.getplastic_clipControl(element)?.value || 0;
    const valleyht_profile = this.getvalleyht_profileControl(element)?.value || 0;
    const area_shutter = this.getarea_shutterControl(element)?.value || 0;
    const agentCommission = this.getRowCommissionControl(element)?.value || 0;
    const shutter_area_other = this.getshutter_area_otherControl(element)?.value || 0;
    const free_item_amount = this.getfree_item_amountControl(element)?.value || 0;
    //commission

    const originalRate = this.getRateControl(element)?.value || 0;
    const originalPurchasePrice = this.getpurchase_priceControl(element)?.value || 0; //back panel
    const originalal_profilePrice = this.getal_profileControl(element)?.value || 0;
    const originalmultitop_profilePrice = this.getmultitop_profileControl(element)?.value || 0;
    const originalplastic_clipPrice = this.getplastic_clipControl(element)?.value || 0;
    const originalvalleyht_profilePrice = this.getvalleyht_profileControl(element)?.value || 0;


    const isCabinetCategory = this.getCategoryControl(element)?.value === 'CABINET';
    const shouldDisableFields =
      this.getinitial_sgstControl(element)?.disabled ||
      this.getinitial_cgstControl(element)?.disabled ||
      this.getinitial_igstControl(element)?.disabled;
    let amountall = 0;
    let aaaa = 0;
    let data = 0;

    let updatedRate = 0;
    let updatedal_profilePrice = 0;
    let updatedplastic_clipPrice = 0;
    let updatedmultitop_profilePrice = 0;
    let updatedvalleyht_profilePrice = 0;
    let updatedPurchasePrice = 0;

    // Calculate the commission amount for purchase price
    const commissionAmountForRate = (agentCommission / 100) * originalRate;
    updatedRate = originalRate + commissionAmountForRate;

    const commissionAmountForPurchasePrice = (agentCommission / 100) * originalPurchasePrice;
    updatedPurchasePrice = originalPurchasePrice + commissionAmountForPurchasePrice;

    const commissionAmountal_profilePrice = (agentCommission / 100) * originalal_profilePrice;
    updatedal_profilePrice = originalal_profilePrice + commissionAmountal_profilePrice;

    const commissionAmountFormultitop_profilePrice = (agentCommission / 100) * originalmultitop_profilePrice;
    updatedmultitop_profilePrice = originalmultitop_profilePrice + commissionAmountFormultitop_profilePrice;

    const commissionAmountForplastic_clipPrice = (agentCommission / 100) * originalplastic_clipPrice;
    updatedplastic_clipPrice = originalplastic_clipPrice + commissionAmountForplastic_clipPrice;

    const commissionAmountForvalleyht_profilePrice = (agentCommission / 100) * originalvalleyht_profilePrice;
    updatedvalleyht_profilePrice = originalvalleyht_profilePrice + commissionAmountForvalleyht_profilePrice;
    const selectedCategory = this.quotations_descriptions.get('item_category')?.value;
    let totalWithoutDiscount = quantity * updatedRate;
    if (shouldDisableFields || selectedCategory === 'OTHERS') {
      // Calculate for "Others" where fields are disabled
      amountall = quantity * updatedRate;
    } else if (isCabinetCategory) {
      // Calculate for "Cabinet"

      const sgstInFeet = this.convertMmToFeet(initial_sgst); //width
      const cgstInFeet = this.convertMmToFeet(initial_cgst); //depth
      const igstInFeet = this.convertMmToFeet(initial_igst); //height

      data =
        (
          (igstInFeet * cgstInFeet * 2 * updatedRate * quantity) +
          (sgstInFeet * cgstInFeet * shelves_count * updatedRate * quantity) +
          (sgstInFeet * igstInFeet * updatedPurchasePrice * quantity) +
          (updatedal_profilePrice * initial_sgst * quantity) +
          (updatedvalleyht_profilePrice * initial_sgst * quantity) +
          (updatedmultitop_profilePrice * initial_sgst * 2 * quantity) +
          (updatedplastic_clipPrice * quantity)
        );
      const safeTotalShutterArea = this.totalShutterArea || 0;
      this.quotations_descriptions.get('safeTotalShutterArea')?.setValue(safeTotalShutterArea);
      if (selectedCategory === 'OTHER-CABINET') {
        amountall = quantity * updatedRate;
      }
      else if (selectedCategory === 'FREE-ITEM') {
        amountall = free_item_amount;
      }
      else if (selectedCategory === 'SHUTTER') {
        amountall = updatedRate * quantity * safeTotalShutterArea; // If category is 'SHUTTER'
      } else {
        amountall = data; // For other categories
      }
    } else {
      const sgstInFeet = this.convertMmToFeet(initial_sgst); //width
      const cgstInFeet = this.convertMmToFeet(initial_cgst); //depth
      const igstInFeet = this.convertMmToFeet(initial_igst); //height
      data =
        (
          (igstInFeet * cgstInFeet * 2 * updatedRate * quantity) +
          (sgstInFeet * cgstInFeet * shelves_count * updatedRate * quantity) +
          (sgstInFeet * igstInFeet * updatedPurchasePrice * quantity) +
          (updatedal_profilePrice * initial_sgst * quantity) +
          (updatedvalleyht_profilePrice * initial_sgst * quantity) +
          (updatedmultitop_profilePrice * initial_sgst * 2 * quantity) +
          (updatedplastic_clipPrice * quantity)
        );
      const safeTotalShutterArea = this.totalShutterArea || 0;
      this.quotations_descriptions.get('safeTotalShutterArea')?.setValue(safeTotalShutterArea);

      if (shouldDisableFields || selectedCategory === 'OTHERS') {
        // Calculate for "Others" where fields are disabled
        amountall = quantity * updatedRate;
      } else if (selectedCategory === 'OTHER-CABINET') {
        amountall = quantity * updatedRate;
      }
      else if (selectedCategory === 'FREE-ITEM') {
        amountall = free_item_amount;
      }
      else if (selectedCategory === 'SHUTTER') {
        amountall = updatedRate * quantity * safeTotalShutterArea; // If category is 'SHUTTER'
      } else {
        amountall = data; // For other categories
      }
    }

    const amount = amountall;

    return parseFloat(element.amount);
  }

  numberToWords(number: number): string {
    const units: string[] = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens: string[] = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens: string[] = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (num: number): string => {
      if (num < 10) return units[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + numToWords(num % 10) : '');
      if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numToWords(num % 100) : '');
      if (num < 100000) // For thousands and below
        return numToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '');
      if (num < 10000000) // For lakhs
        return numToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numToWords(num % 100000) : '');
      if (num < 1000000000) // For crores
        return numToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numToWords(num % 10000000) : '');
      return numToWords(Math.floor(num / 1000000000)) + ' Billion' + (num % 1000000000 !== 0 ? ' ' + numToWords(num % 1000000000) : '');
    };

    const grandTotalWords = numToWords(Math.floor(number));
    const decimalPart = Math.round((number - Math.floor(number)) * 100); // Get the two decimal places
    const decimalWords = decimalPart > 0 ? numToWords(decimalPart).toLowerCase() : '';

    return decimalPart > 0 ? `${grandTotalWords} and ${decimalWords} Paise` : grandTotalWords; // Combine the words for grand_total and decimal part
  }


  // Function to update the amount when the quantity changes
  updateAmount(element: PeriodicElement): void {
    const quantityControl = this.getQuantityControl(element);
    if (quantityControl.valid) {
      const newAmount = this.calculateAmount(element);
      this.customerForm
        .get('quotations_descriptions')
        ?.get([this.dataSource.data.indexOf(element)])
        ?.patchValue({ amount: newAmount.toFixed(2) });
    }
  }
  isReadOnly: boolean = false;
  activeImageIndex: number | null = null; // To store the index of the active image

  toggleZoom(index: number): void {
    if (this.activeImageIndex === index) {
      this.activeImageIndex = null; // If the same image is clicked, zoom out
    } else {
      this.activeImageIndex = index; // Set the active image index to the clicked one
    }
  }

  isActiveImage(index: number): boolean {
    return this.activeImageIndex === index; // Check if this image is the active one
  }

removeItem(index: number) {
  if (this.quotations_descriptions.length <= 1) {
    this.toastr.warning('At least one row must remain.');
    return;
  }

  const confirmDelete = window.confirm('Are you sure you want to delete this Row?');
  if (!confirmDelete) return;

  const row = this.quotations_descriptions.at(index)?.value;
  console.log('Form data at index', index, row);


  const quotationDescId = row?.id; // ✅ use correct field
  const quotationId = this.QuotationId; // ✅ ensure this is set

  console.log('Attempting to delete quotationDescId:', quotationDescId);
  console.log('Quotation ID:', quotationId);

  if (quotationDescId && quotationId) {
    this.quotationService.deleteQuotationDescriptions(quotationId, quotationDescId).subscribe({
      next: () => {
        this.removeRowLocally(index);
        this.toastr.success('Row Deleted Successfully!');
      },
      error: (err) => {
        console.error('Error deleting from backend:', err);
        this.toastr.error('Error deleting from database.');
      }
    });
  } else {
    console.warn('No valid ID found. Removing locally only.');
    this.removeRowLocally(index);
    this.toastr.success('Row Removed Locally.');
  }
}


removeRowLocally(index: number) {
  this.quotations_descriptions.removeAt(index);

  for (let i = 0; i < this.quotations_descriptions.length; i++) {
    this.allFieldWorking(i);
  }

  this.calculateTotalsnew();
  this.calculateGrandTotal();

  this.dataSource.data = this.quotations_descriptions.value;
}


  goBack() {
    this.router.navigate(['/quotation/list']);
  }
  onSubmittable() { }

  onSubmitcopy(): void {
    this.customerForm.get('discountedAmount')?.enable();
    this.customerForm.get('cgstAmount')?.enable();
    this.customerForm.get('igstAmount')?.enable();
    this.customerForm.get('grand_total')?.enable();
    this.customerForm.get('sgstAmount')?.enable();

    var quotationId = this.customerForm.get('quotation_id')?.value;
    var typeCommission = this.customerForm.get('agent_commission')?.value;

    this.customerForm.get('is_coppied')?.setValue(quotationId);
    this.customerForm.get('type_of_commission')?.setValue(typeCommission);

    this.quotations_descriptions.controls.forEach((control) => {
      const amount = this.calculateAmount(control.value);
      control.get('amount')?.setValue(amount.toFixed(2));

      // Ensure select_service is properly set for all descriptions
      if (!control.get('select_service')?.value) {
        control.get('select_service')?.setValue(this.customerForm.get('select_service')?.value);
      }
    });

    if (this.customerForm.valid) {
      this.isSendingEmail = true;
      this.isLoading = true;
      this.isGetItemListMode = false;
      const quotationData = this.customerForm.value;
      quotationData.remark = quotationData.remark.replace(/\n/g, '<br>');
      quotationData.quotations_descriptions = this.quotations_descriptions.value;

      this.customerForm.get('quotations_descriptions')?.setErrors(null);

      // image upload
      if (this.selectedLogos.length > 0) {
        const formData = new FormData();
        const formArray = this.customerForm.get('companyLogoOne') as FormArray;

        // Append each image file data to FormData
        formArray.controls.forEach((control, index) => {
          formData.append(`companyLogoOne_${index}`, control.value);
        });

      }

      quotationData.quotations_descriptions.forEach((description: any) => {
        description.select_service = JSON.stringify(description.select_service);
        if (!description.item_name) {
          description.item_name = description.service_name || 'Default Item'; // Assign a default or other meaningful value
        }
        if (!description.item_category) {
          description.item_category = description.select_category || 'Default Item'; // Assign a default or other meaningful value
        }
        if (description.itemDescription && Array.isArray(description.itemDescription)) {
          description.itemDescription = description.itemDescription.join(', ');
        }
        description.total_quantity = this.customerForm.get('total_quantity')?.value;
        description.total_rate = this.customerForm.get('total_rate')?.value;
        description.total_amount = this.customerForm.get('total_amount')?.value;
        description.discountedAmount = this.customerForm.get('discountedAmount')?.value;
        description.igstAmount = this.customerForm.get('igstAmount')?.value;
        description.cgstAmount = this.customerForm.get('cgstAmount')?.value;
        description.sgstAmount = this.customerForm.get('sgstAmount')?.value;
        description.grand_total = this.customerForm.get('grand_total')?.value;
        description.grand_total_in_words = this.customerForm.get('grand_total_in_words')?.value;
        description.transport = this.customerForm.get('transport')?.value;

        // Include sgst, igst, discount, and amount fields
        description.sgst = this.customerForm.get('sgst')?.value;
        description.igst = this.customerForm.get('IGST')?.value;
        description.cgst = this.customerForm.get('cgst')?.value;
        description.discount = this.customerForm.get('discount')?.value;
      });

      if (this.editingMode) {
        if (this.selectedQuotation) {
          if (this.isServiceTableSelected) {
            quotationData.quotation_id = null;
            this.createQuotationNEW(quotationData);
          }
        }
      } else {
        if (this.isServiceTableSelected) {
          quotationData.quotation_id = null;
          this.createQuotationNEW(quotationData);
        }
      }
    } else {
      this.isLoading = false;
      this.toastr.error('Form is invalid');
    }
  }
  createQuotationNEW(quotationData: any): void {
    const userData = this.customerForm.value;
    userData.loginserquot_id = this.loginUserId;
    userData.login_company = this.myCompany;
    userData.loginUserName = this.loginUserName;
    userData.role = this.loginUserRole;
    // Stringify select_customer if necessary
    const selectedCustomerString = JSON.stringify(userData.select_customer);

    // Ensure select_service is properly set for each description
    const descriptions = this.quotations_descriptions.value.map((desc: any) => {
      // Ensure to preserve select_service for existing rows
      if (desc.select_service && typeof desc.select_service === 'object') {
        return {
          ...desc,
          select_service: JSON.stringify(desc.select_service), // Stringify for new rows only
          service_name: desc.select_service.service_name
        };
      }
      return desc; // Existing rows should remain unchanged
    });

    // Create formData with adjusted descriptions
    const formData = {
      ...userData,
      select_customer: selectedCustomerString,
      quotations_descriptions: descriptions // Include descriptions with adjusted select_service
    };

    this.quotationService.createQuotation(formData).subscribe(
      (response: any) => {
        this.toastr.success('Quotation Copied successfully!');
        this.router.navigate(['/quotation/list']);
        this.isSendingEmail = false;
        this.isLoading = false;
        this.quotationService.notifyCategoryAdded();
      },
      (error: any) => {
        this.toastr.error('Error adding Quotation!');
        this.isSendingEmail = false;
        this.isLoading = false;
      }
    );
  }

  // -----------------------------------table-------------------------------------------------
  isServiceTableSelected: boolean = true; // Default to show service table
  isProductTableSelected: boolean = false;

  selectServiceTable() {
    this.isServiceTableSelected = true;
    this.isProductTableSelected = false;
  }

  selectProductTable() {
    this.isServiceTableSelected = false;
    this.isProductTableSelected = true;
  }
  resetForm(): void {
    this.customerForm.reset();
  }
  onFilesSelected(event: any): void {
    const files = event.target.files;
    const formArray = this.customerForm.get('companyLogoOne') as FormArray;
    this.selectedLogos = []; // Clear previously selected images
    // Check if the number of files exceeds the limit (4 images)
    if (this.selectedLogos.length + files.length > 9) {
      this.toastr.warning('You can only select up to 9 images.');
      event.target.value = null;  // Clear the input field
      return;
    }
    for (let file of files) {
      const fileSizeInKB = file.size / 1024;

      // Check if the file size is within the limit
      if (fileSizeInKB > 250) {
        // Handle file size error
        event.target.value = null;
        this.customerForm.patchValue({ companyLogoOne: [] });
        this.selectedLogos = [];
        this.fileSizeError = true;
        return;
      }

      // Read the file as base64 and update the form control
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = reader.result as string;
        formArray.push(new FormControl(fileData)); // Add image file data to formArray
        this.selectedLogos.push(fileData); // Add the image preview to the array
      };
      reader.readAsDataURL(file);
    }

    // Reset the file input field
    this.fileSizeError = false;
  }
  // -----------------------------------product table-------------------------------------------------
  updateGrandTotal(totalAmount: number): void {
    this.grandTotal = totalAmount;

    // Check if the form control exists
    if (this.customerForm.get('grand_total')) {
      // Update the grand_total field with formatted value
      this.customerForm.get('grand_total')?.setValue(this.grandTotal.toFixed(2));

      // Convert the total amount to words
      const totalInWords = this.numberToWords(totalAmount);

      // Update grand_total_in_words
      this.customerForm.get('grand_total_in_words')?.setValue(totalInWords);
    } else {
    }
  }

  
}