export type Product = { id: string; name: string; brand: string; category: string; price: number; original_price: number; unit: string; image_url: string; rating: number; in_stock: boolean; popularity: number };
export type OrderItem = { product_id: string; name: string; unit: string; image_url: string; quantity: number; price: number };
export type Customer = { customer_name: string; customer_phone: string; delivery_area: string; delivery_address: string };
export type OrderStatus = 'Pending' | 'Packing' | 'Out for Delivery' | 'Delivered';
export type Order = Customer & { id: string; items: OrderItem[]; subtotal: number; delivery_fee: number; total_amount: number; payment_method: 'Cash on Delivery'; status: OrderStatus; created_at: string };
