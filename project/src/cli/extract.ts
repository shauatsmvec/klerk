import { SupplierInvoiceExtractor } from '../services/SupplierInvoiceExtractor';

const text = 'Supplier: Example Supplier\nDocument date: 12/06/2026\nDue date: 20/06/2026\nTotal TTC: 1246,80 €';
const service = new SupplierInvoiceExtractor();
console.log(JSON.stringify(service.extract(text), null, 2));
