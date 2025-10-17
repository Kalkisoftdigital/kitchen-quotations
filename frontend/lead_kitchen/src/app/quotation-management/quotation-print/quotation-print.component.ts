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
@Component({
  selector: 'app-quotation-print',
  templateUrl: './quotation-print.component.html',
  styleUrls: ['./quotation-print.component.scss']
})
export class QuotationPrintComponent {
  @ViewChild('printable', { static: false }) printable!: ElementRef;
  selectedCompanyName: string | null = null;
  companyAddress: string | null = null;
  companyLandline: string | null = null;
  email: string | null = null;
  bankDetails: string | null = null;
  ifscCode: string | null = null;
  accountNo: string | null = null;
  selectedLogo: string | null = null;
  net_amount: number = 0;
  quotation: any;
  totalRows: number = 8;
  emptyRows: any[] = []; // Array to hold empty rows
  source: string | null = null;
  isSendingEmail: boolean = false; // Loading indicator variable

  constructor(
    private route: ActivatedRoute,
    private customerService: QuotationManagementService,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const quotationId = parseInt(id, 10); // Parse id to number
      this.customerService.getQuotationById(quotationId).subscribe(
        (data) => {
          this.quotation = data;
        },
        (error) => {}
      );
    }
    this.route.params.subscribe((params) => {
      const id = params['id'];
      // Fetch quotation details using the ID
      // Example: this.quotationService.getQuotationById(id).subscribe(...)
    });
    // Initialize empty rows
    this.initializeEmptyRows();

    // Retrieve the navigation state to determine the source
    this.route.queryParams.subscribe((params) => {
      this.source = params['source'];
    });

    this.fetchCompanies();

    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const first_Name = user.user ? user.user.firstName : null;

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
        // this.toastr.error('Error fetching Companies for user');
      }
    );
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

  // Initialize empty rows to fill the table
  initializeEmptyRows(): void {
    const rowsNeeded = this.totalRows - (this.quotation?.data?.descriptions?.length || 0);
    this.emptyRows = Array(rowsNeeded > 0 ? rowsNeeded : 0).fill(0);
  }

  goBack() {
    if (this.source === 'table') {
      this.router.navigate(['quotation/list']);
    } else if (this.source === 'details') {
      this.router.navigate(['enquiry/list']);
    } else {
      // Default behavior if the source is unknown
      this.router.navigate(['/']); // Change this to the default route if necessary
    }
  }

  // calculateNetAmount(): number {
  //   // Convert necessary properties to numbers
  //   const transportCharge = parseFloat(this.quotation?.data?.quotation.transport);
  //   const cgstAmount = parseFloat(this.quotation?.data?.quotation.cgstAmount);
  //   const igstAmount = parseFloat(this.quotation?.data?.quotation.igstAmount);
  //   const sgstAmount = parseFloat(this.quotation?.data?.quotation.sgstAmount);
  //   const discountedAmount = parseFloat(this.quotation?.data?.quotation.discountedAmount);

  //   // Calculate net amount
  //   const netAmount = transportCharge + cgstAmount + igstAmount + sgstAmount - discountedAmount;

  //   return netAmount;
  // }

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
        const businessName = this.quotation?.data?.quotation?.business_name || 'Unknown';
        const quotationId = this.quotation?.data?.quotation?.quotation_id || 'Unknown';

        const fileName = `quotation_${businessName}_ID-${quotationId}.pdf`;

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

        // Send the PDF via email
        this.http
          .post<any>('https://kitchen-backend-2.cloudjiffy.net/sendQuotationEmail', {
            fileName: fileName,
            pdfData: pdfBase64,
            recipientEmail: recipientEmail,
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
