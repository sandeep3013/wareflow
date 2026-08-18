export type ProductCategory =
  | 'Keyboards & Mice'
  | 'Monitors & Displays'
  | 'Cables & Adapters'
  | 'Storage & Memory'
  | 'Audio & Headsets'
  | 'Mounts & Ergonomics'
  | 'Networking & Hubs';

export interface ProductDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightGrams: number;
}

export interface Product {
  sku: string;
  name: string;
  category: ProductCategory;
  description: string;
  barcode: string;
  dimensions: ProductDimensions;
  unitPrice: number;
  costPrice: number;
  reorderPoint: number;
  idealStockLevel: number;
  imageUrl: string;
  leadTimeDays: number;
  hazardClass?: 'NONE' | 'LITHIUM_BATTERY' | 'FRAGILE';
  createdAt: string;
}
