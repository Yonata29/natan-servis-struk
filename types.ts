export interface ComponentItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // Total price for this component line
}

export interface InvoiceDetails {
  itemName: string;
  ownerName: string;
  ownerPhone?: string; // Added owner's phone number
  damageType: string;
  invoiceDate: string; // YYYY-MM-DD
  warrantyPeriod: string; // e.g., "1 Minggu", "1 Bulan"
  components: ComponentItem[];
  serviceFee: number;
}