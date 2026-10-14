export type Product = { id: string; name: string; brand: string; category: string; price: number|null; original_price: number|null; unit: string; image_url: string; rating: number|null; in_stock: boolean; popularity: number; catalog_code?:string; barcode?:string|null; sku?:string|null; source_name?:string|null };
export type OrderItem = { product_id: string; name: string; unit: string; image_url: string; quantity: number; price: number };
export type Customer = { customer_name: string; customer_phone: string; delivery_area: string; delivery_address: string; delivery_latitude?:number|null; delivery_longitude?:number|null; delivery_distance_km?:number|null };
export type OrderStatus = 'Pending' | 'Packing' | 'Out for Delivery' | 'Delivered';
export type Order = Customer & { id: string; items: OrderItem[]; subtotal: number; delivery_fee: number; total_amount: number; payment_method: 'Cash on Delivery'; status: OrderStatus; created_at: string };
