import { ClassificationService } from '../services/ClassificationService';

const text = 'Facture fournisseur Example Supplier\nDate 12/06/2026\nTotal TTC 1246,80 €';
const service = new ClassificationService();
console.log(JSON.stringify(service.classify(text), null, 2));
