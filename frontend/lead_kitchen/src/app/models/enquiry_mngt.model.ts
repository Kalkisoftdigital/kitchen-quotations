// Define interface for quotations description
export interface QuotationDescription {
    id: number | null;
    select_service: number | null;
    itemDescription: string | null;
    item_name: string;
    item_category:string;
    hsn_code: string | null;
    unit_of_measurement: string | null;
    quantity: number | null;
    rate: number | null;
    initial_discount: string | null;
    initial_sgst: string | null;
    initial_cgst: string | null;
    initial_igst: string | null;
    shutter_area_other: string | null;
    area_shutter: string | null;
    add_extra_area: string | null;
    free_item_desc: string | null;
    amount: number | null;
    free_item_amount: number | null;
    total_quantity: number | null;
    total_rate: number | null;
    total_amount: number | null;
    discount: number | null;
    discountedAmount: number | null;
    igst: number | null;
    igstAmount: number | null;
    cgst: number | null;
    cgstAmount: number | null;
    sgst: number | null;
    sgstAmount: number | null;
    grand_total: number | null;
    grand_total_in_words: string | null;
    special_discount: string | null;
    special_discount_remark: string | null;
    special_discount_total: string | null;
    transport: string | null;
  }
  
  // Define interface for quotation
  export interface Quotation {
    quotation_id: number;
    quotation_date: string;
    reference: string;
    customer_name: string;
    amount_show_hide:string;
    business_name: string;
    agent_commission: string;
    consignee_address: string;
    gstin_no: string;
    state: string;
    remark: string | null;
    other_charges: string | null;
    quotations_descriptions: QuotationDescription[];
    products_descriptions: any[];
  }
  
  // Define interface for response data
  export interface QuotationResponse {
    message: string;
    data: Quotation[];
  }
  export interface PeriodicElement {
    select_service: number; //select_service IS ID
    itemDescription: string;
    item_name: string;
    item_category: string;
    hsn_code: string;
    unit_of_measurement: string;
    rate: string;
    initial_discount: string;
    initial_sgst: string;
    initial_cgst: string;
    initial_igst: string;
    area_shutter: string;
    add_extra_area:string;
    free_item_amount: string;
    shutter_area_other:string;
    free_item_desc: string;
    row_commission: string;
    quantity: string;
    amount: string;
  }