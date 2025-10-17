import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuotationManagementService } from 'src/app/services/quotation-management-service/quotation-management.service';

import html2canvas from 'html2canvas';
import domToImage from 'dom-to-image';
import jsPDF, { jsPDFOptions } from 'jspdf';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/services/company-service/company.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-product-print',
  templateUrl: './product-print.component.html',
  styleUrls: ['./product-print.component.scss']
})
export class ProductPrintComponent {
  @ViewChild('printable', { static: false }) printable!: ElementRef;

  selectedCompanyName: string | null = null;
  companyAddress: string | null = null;
  companyLandline: string | null = null;
  email: string | null = null;
  companyId: number | null = null;
  bankDetails: string | null = null;
  ifscCode: string | null = null;
  accountNo: string | null = null;
  selectedLogo: string | null = null;
  net_amount: number = 0;
  quotation: any;
  user: any;
  totalRows: number = 15;
  emptyRows: any[] = []; // Array to hold empty rows
  source: string | null = null; 
  isLoading = false;
  isSendingEmail: boolean = false; // Loading indicator variable
  isSendingEmails: boolean = false; // Loading indicator variable
  constructor(
    private route: ActivatedRoute,
    private customerService: QuotationManagementService,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.fetchQuotationById(id);
    });

    // Retrieve the navigation state to determine the source
    this.route.queryParams.subscribe((params) => {
      this.source = params['source'];
    });

    this.fetchCompanies();
    this.sessiondata();
  }

  sessiondata() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const first_Name = user.user ? user.user.firstName : null;
    this.user = sessionStorageData ? JSON.parse(sessionStorageData) : null;

    if (user?.user?.select_company) {
      this.setCompanyDetails(user.user.select_company);
    }
  }
  fetchCompanies(page: number = 1, pageSize: number = 10): void {
    this.companyService.getAllCompanies(page, pageSize).subscribe(
      (data: any) => {
        data.data.forEach((element: any) => {});
      },
      (error) => {
        this.toastr.error('Error fetching Companies for user');
      }
    );
  }
  emptyRowCount = 2;

  // Function to generate an array of empty rows
  getEmptyRows() {
    return Array(this.emptyRowCount).fill({}); // Create an array of empty objects
  }
  setCompanyDetails(companyName: string): void {
    this.companyService.getAllCompanies().subscribe(
      (data: any) => {
        const company = data.data.find((element: any) => element.companyName === companyName);
        if (company) {
          this.selectedCompanyName = company.companyName;
          this.companyAddress = company.companyAddress;
          this.companyLandline = company.companyLandline;
          this.email = company.email;
          this.companyId = company.id;
          this.bankDetails = company.bankDetails;
          this.ifscCode = company.ifscCode;
          this.accountNo = company.accountNo;
          if (company.companyLogo) {
            this.selectedLogo = `https://kitchen-backend-2.cloudjiffy.net/${company.companyLogo.replace('\\', '/')}`;
            if (!this.selectedLogo.includes('uploads/')) {
              this.selectedLogo = `https://kitchen-backend-2.cloudjiffy.net/uploads/${company.companyLogo.replace('\\', '/')}`;
            }
          }
        }
      },
      (error) => {
        this.toastr.error('Error fetching company details');
      }
    );
  }
  fetchQuotationById(id: number): void {this.isLoading = true;
    this.customerService.getQuotationById(id).subscribe(
      (data) => {
    
        this.quotation = data;

        // Check if the remark is in plain text and convert line breaks to <br>
        const rawRemark = this.quotation.data.quotation.remark || '';
        const formattedRemark = rawRemark.replace(/\n/g, '<br>');
        this.quotation.remark = this.sanitizer.bypassSecurityTrustHtml(formattedRemark);

        // Process descriptions to handle duplicates
        this.processDescriptions(this.quotation.data.descriptions);
        this.isLoading = false;
       
        // this.initializeEmptyRows(); // Ensure to initialize empty rows after fetching the quotation
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }
  parseLogoArray(logoString: string): string[] {
    try {
      // Parse the JSON string to get an array of image filenames
      return JSON.parse(logoString);
    } catch (e) {
     
      return [];
    }
  }
  
  processDescriptions(descriptions: any[]): void {
    const seenServices = new Set(); // To track seen service names
    const seenHSNs = new Set(); // To track seen hsn codes

    for (const item of descriptions) {
      // Check if service_name has been seen before
      if (seenServices.has(item.service_name)) {
        item.service_name = ''; // Replace with blank if already seen
      } else {
        seenServices.add(item.service_name); // Mark service_name as seen
      }

      // Check if hsn_code has been seen before CHANGED ON 14-12
      // if (seenHSNs.has(item.hsn_code)) {
      //   item.hsn_code = ''; // Replace with blank if already seen
      // } else {
      //   seenHSNs.add(item.hsn_code); // Mark hsn_code as seen
      // }
    }
  }
  isFirstOccurrence(fieldName: string, currentItem: any): boolean {
    const previousItems = this.quotation?.data?.descriptions.slice(0, this.quotation.data.descriptions.indexOf(currentItem));
    
    if (fieldName === 'item_name') {
      return !previousItems.some((item: any) => item.item_name === currentItem.item_name);
    }else if (fieldName === 'free_item_desc') {
      return !previousItems.some((item: any) => item.free_item_desc === currentItem.free_item_desc);
    }
    else if (fieldName === 'itemDescription') {
      return !previousItems.some((item: any) => item.itemDescription === currentItem.itemDescription);
    }
    else if (fieldName === 'hsn_code') {
      return !previousItems.some((item: any) => item.hsn_code === currentItem.hsn_code);
    }

    return false;
  }
  isFirstOccurrences(field: string, currentItem: any): boolean {
    const fieldValue = currentItem[field];

    // Check if the fieldValue is the first occurrence in the descriptions array
    return (
      this.quotation.data.descriptions.findIndex((item: any) => item[field] === fieldValue) ===
      this.quotation.data.descriptions.indexOf(currentItem)
    );
  }
  // Initialize empty rows to fill the table
  // initializeEmptyRows(): void {
  //   const rowsNeeded = this.totalRows - (this.quotation?.data?.descriptions?.length || 0);
  //   this.emptyRows = Array(rowsNeeded > 0 ? rowsNeeded : 0).fill(0);
  // }

  goBack() {
    if (this.source === 'table') {
      this.router.navigate(['quotation/list']);
    } else if (this.source === 'emailSendData') {
      this.router.navigate(['EmailSendData/']);
    } else if (this.source === 'details') {
      this.router.navigate(['enquiry/list']);
    } else {
      // Default behavior if the source is unknown
      // this.router.navigate(['/']);
      this.router.navigate(['quotation/list']);
    }
  }

  printQuotation(): void {
    window.print(); // Trigger browser's print dialog
  }

  saveAsPDF(): void {
    const width = this.printable.nativeElement.clientWidth;
    const height = this.printable.nativeElement.clientHeight + 40;
    let orientation: 'l' | 'p' | 'portrait' | 'landscape' | undefined = undefined;
    let imageUnit: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc' | undefined = 'pt';
    if (width > height) {
      orientation = 'l';
    } else {
      orientation = 'p';
    }
    domToImage
      .toPng(this.printable.nativeElement, {
        width: width,
        height: height
      })
      .then((result) => {
        let jsPdfOptions: jsPDFOptions = {
          orientation: orientation,
          unit: imageUnit,
          format: [width + 50, height + 220]
        };
        const pdf = new jsPDF(jsPdfOptions);
        const x = (pdf.internal.pageSize.getWidth() - width) / 2;
        const y = (pdf.internal.pageSize.getHeight() - height) / 2;
        pdf.addImage(result, 'PNG', x, y, width, height);
        // Retrieve business_name from quotation data
        const businessName = this.quotation?.data?.quotation?.customer_name || 'Unknown';
        const quotationId = this.quotation?.data?.quotation?.quotation_id || 'Unknown';

        const fileName = `quotation_${businessName}_QUOTE${quotationId}.pdf`;

        // Save the PDF
        pdf.save(fileName);
      })
      .catch((error) => {});
  }

  parseServiceName(selectService: string): string {
    try {
      const service = JSON.parse(selectService);
      return service.service_name || '';
    } catch (error) {
      return '';
    }
  }

  parseCategory(serviceString: string): string {
    const service = JSON.parse(serviceString);
    return service.select_category;
  }

  calculateAmount(quotation: any): string {
    const amount = parseFloat(quotation.rate) * parseInt(quotation.quantity);
    return amount.toFixed(2);
  }

  sendQuotationByEmail(): void {
    this.isSendingEmail = true;
    const width = this.printable.nativeElement.clientWidth;
    const height = this.printable.nativeElement.clientHeight + 40;
    let orientation: 'l' | 'p' | 'portrait' | 'landscape' | undefined = undefined;
    let imageUnit: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc' | undefined = 'pt';
    if (width > height) {
      orientation = 'l';
    } else {
      orientation = 'p';
    }
    domToImage
      .toPng(this.printable.nativeElement, {
        width: width,
        height: height
      })
      .then((result) => {
        let jsPdfOptions: jsPDFOptions = {
          orientation: orientation,
          unit: imageUnit,
          format: [width + 50, height + 220]
        };
        const pdf = new jsPDF(jsPdfOptions);
        const x = (pdf.internal.pageSize.getWidth() - width) / 2;
        const y = (pdf.internal.pageSize.getHeight() - height) / 2;
        pdf.addImage(result, 'PNG', x, y, width, height);

        const businessName = this.quotation?.data?.quotation?.business_name || 'Unknown';
        const quotationId = this.quotation?.data?.quotation?.quotation_id || 'Unknown';
        const fileName = `quotation_${businessName}_ID-${quotationId}.pdf`;

        const serviceNames = this.quotation?.data?.descriptions?.map((desc: any) => {
          return JSON.parse(desc.select_service)?.service_name;
        });

        // Combine service names into a single string with numbered list - show 1st
        const serviceNamesString = serviceNames?.[0] ? `${serviceNames[0]}` : '';

        // Convert PDF to base64 and strip Data URI prefix
        const pdfBase64 = pdf.output('datauristring').split(',')[1];

        const recipientEmail = this.quotation?.data?.quotation?.email || 'default@example.com';
        const customerName = this.quotation?.data?.quotation?.customer_name || 'Unknown';
        const senderEmail = this.user?.user?.email || 'default@example.com';
        const companyName = this.user?.user?.select_company || 'Unknown';
        const superAdmin_name = this.user?.user?.sessionUser_name || 'Unknown';
        const userName = this.user?.user?.fullname || 'Unknown';
        const superAdminId = this.user?.user?.sessionUser_id || 'Unknown';
        const User_id = this.user?.user?.id || 'Unknown';

        const companyEmail = this.email || 'Unknown';
        const companyId = this.companyId || 'Unknown';

        // Send the PDF via email
        this.http
          .post<any>('https://kitchen-backend-2.cloudjiffy.net/sendQuotationEmail', {
            fileName: fileName,
            pdfData: pdfBase64,
            recipientEmail: recipientEmail,
            customerName: customerName,
            senderEmail: senderEmail,
            companyName: companyName,
            userName: userName,
            superAdmin_name: superAdmin_name,
            superAdminId: superAdminId,
            User_id: User_id,
            quotationId: quotationId,
            companyEmail: companyEmail,
            companyId: companyId,
            businessName: businessName,
            serviceNames: serviceNamesString
          })
          .subscribe(
            (response) => {
              this.toastr.success(`Email sent successfully to ${businessName}`);
              this.isSendingEmail = false;
            },
            (error) => {
              this.toastr.error('Error sending email');
              this.isSendingEmail = false;
            }
          );
      })
      .catch((error) => {
        this.toastr.error('Error saving PDF');
      });
  }
  sendQuotationByEmails(): void {
    this.isSendingEmails = true;
    const width = this.printable.nativeElement.clientWidth;
    const height = this.printable.nativeElement.clientHeight + 40;
    let orientation: 'l' | 'p' | 'portrait' | 'landscape' | undefined = undefined;
    let imageUnit: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc' | undefined = 'pt';
    if (width > height) {
      orientation = 'l';
    } else {
      orientation = 'p';
    }
    domToImage
      .toPng(this.printable.nativeElement, {
        width: width,
        height: height
      })
      .then((result) => {
        let jsPdfOptions: jsPDFOptions = {
          orientation: orientation,
          unit: imageUnit,
          format: [width + 50, height + 220]
        };
        const pdf = new jsPDF(jsPdfOptions);
        const x = (pdf.internal.pageSize.getWidth() - width) / 2;
        const y = (pdf.internal.pageSize.getHeight() - height) / 2;
        pdf.addImage(result, 'PNG', x, y, width, height);

        const businessName = this.quotation?.data?.quotation?.business_name || 'Unknown';
        const quotationId = this.quotation?.data?.quotation?.quotation_id || 'Unknown';
        const fileName = `quotation_${businessName}_ID-${quotationId}.pdf`;

        const serviceNames = this.quotation?.data?.descriptions?.map((desc: any) => {
          return JSON.parse(desc.select_service)?.service_name;
        });

        // Combine service names into a single string with numbered list - show 1st
        const serviceNamesString = serviceNames?.[0] ? `${serviceNames[0]}` : '';

        // Convert PDF to base64 and strip Data URI prefix
        const pdfBase64 = pdf.output('datauristring').split(',')[1];

        const recipientEmail = this.quotation?.data?.quotation?.email || 'default@example.com';
        const customerName = this.quotation?.data?.quotation?.customer_name || 'Unknown';
        const senderEmail = this.user?.user?.email || 'default@example.com';
        const companyName = this.user?.user?.select_company || 'Unknown';
        const superAdmin_name = this.user?.user?.sessionUser_name || 'Unknown';
        const userName = this.user?.user?.fullname || 'Unknown';
        const superAdminId = this.user?.user?.sessionUser_id || 'Unknown';
        const User_id = this.user?.user?.id || 'Unknown';

        const companyEmail = this.email || 'Unknown';
        const companyId = this.companyId || 'Unknown';

        // Send the PDF via email
        this.http
          .post<any>('https://kitchen-backend-2.cloudjiffy.net/sendQuotationEmail', {
            fileName: fileName,
            pdfData: pdfBase64,
            recipientEmail: recipientEmail,
            customerName: customerName,
            senderEmail: senderEmail,
            companyName: companyName,
            userName: userName,
            superAdmin_name: superAdmin_name,
            superAdminId: superAdminId,
            User_id: User_id,
            quotationId: quotationId,
            companyEmail: companyEmail,
            companyId: companyId,
            businessName: businessName,
            serviceNames: serviceNamesString
          })
          .subscribe(
            (response) => {
              this.toastr.success(`Email sent successfully to ${businessName}`);
              this.isSendingEmails = false;
            },
            (error) => {
              this.toastr.error('Error sending email');
              this.isSendingEmails = false;
            }
          );
      })
      .catch((error) => {
        this.toastr.error('Error saving PDF');
      });
  }
  sendWhatsapp(): void {
    // Assuming you already have a method to save the quotation as a PDF
    this.saveAsPDF();

    // Extract contact number from quotation data
    const contactNumber = this.quotation?.data?.quotation?.contact_number;
    if (!contactNumber) {
      return;
    }

    // Prepend country code for India
    const countryCode = '+91';
    const formattedContactNumber = countryCode + contactNumber;

    // Construct WhatsApp message with PDF download link
    const pdfFileName = `quotation_${this.quotation?.data?.quotation?.business_name}_ID-${this.quotation?.data?.quotation?.quotation_id}.pdf`;
    const pdfDownloadLink = `https://kitchen-backend-2.cloudjiffy.net/${pdfFileName}`; // Replace with the actual URL to download the PDF file
    const whatsappMessage = `Dear Customer, please find the quotation attached.\nDownload PDF: ${pdfDownloadLink}`;

    // Open WhatsApp Web in a new tab with the generated message
    const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${formattedContactNumber}&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappWebUrl, '_blank');
  }
}
