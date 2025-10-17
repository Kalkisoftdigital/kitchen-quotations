export interface Enquiry {
  id: number;
  name: string;
  loginUserName: string;
  contact_person: string;
  contact_number: number;
  business_name: string;
  product_service: string;
  select_state: string;
  quotationMailSend: string;
  select_city: number;
  status_main: string;
  address: string;
  email: string;
  createdOn: string;
  select_socialMedia: string;
  formOption: string;
  reference: string;
  other_reference: string;
  other_personal_contact: string;
  gst_in: string;
  isExpanded: boolean;
  details?: EnquiryDetail[];
  hasServiceQuotation?: boolean;
  hasProductQuotation?: boolean;

}

export interface EnquiryDetail {
  id: number;
  enquiryId: number;
  date: Date | string;
  remark: string;
  status: string;
  member_files?: any[];
  submitted?: boolean;
  time: string;
  selectedFile?: File; 
}
