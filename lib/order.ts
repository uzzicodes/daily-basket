import { z } from 'zod';
import { DELIVERY_FEE, FREE_DELIVERY, STORE, money } from './constants';
import { deliveryDistanceKm, deliveryPinUrl, withinDeliveryRange } from './delivery';
import type { Customer, OrderItem, Product } from './types';
const customerFields = z.object({
  customer_name: z.string().trim().min(2, 'Please enter your full name.').max(100),
  customer_phone: z.string().trim().transform(v => v.replace(/[\s()-]/g, '')).refine(v => /^(?:03\d{9}|\+923\d{9}|923\d{9})$/.test(v), 'Enter a valid Pakistani mobile number.'),
  delivery_area: z.string().trim().min(2,'Enter your locality or block.').max(100),
  delivery_address: z.string().trim().min(10, 'Enter your house and street address.').max(500),
  delivery_latitude: z.number({required_error:'Choose your delivery pin before ordering.'}).finite().min(-90).max(90),
  delivery_longitude: z.number({required_error:'Choose your delivery pin before ordering.'}).finite().min(-180).max(180),
});
function deliveryCheck(customer:{delivery_latitude:number;delivery_longitude:number},ctx:z.RefinementCtx){if(!withinDeliveryRange({latitude:customer.delivery_latitude,longitude:customer.delivery_longitude}))ctx.addIssue({code:z.ZodIssueCode.custom,path:['delivery_latitude'],message:'Sorry, we deliver only within 5 km of our PGECHS Phase 1 store. Choose a nearby delivery address.'});}
export const customerSchema=customerFields.superRefine(deliveryCheck);
export const orderSchema = customerFields.extend({
  items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(99) }).strict()).min(1).max(60),
  idempotency_key: z.string().uuid(),
  expected_total: z.number().finite().positive().max(9999999999.99).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.0001, 'Invalid checkout total.'),
}).strict().superRefine(deliveryCheck);
export function priceOrder(request: {product_id: string; quantity: number}[], products: Product[]) {
  const seen = new Set<string>();
  const items: OrderItem[] = request.map(item => {
    if (seen.has(item.product_id)) throw new Error('Duplicate product in basket.');
    seen.add(item.product_id);
    const product = products.find(p => p.id === item.product_id);
    if (!product || !product.in_stock || product.price===null || product.price<=0) throw new Error('An item is unavailable. Refresh your basket.');
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error('Invalid item quantity.');
    return {product_id: product.id, name: product.name, unit: product.unit, image_url: product.image_url, quantity: item.quantity, price: product.price};
  });
  const subtotal = Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
  const delivery_fee = subtotal >= FREE_DELIVERY ? 0 : DELIVERY_FEE;
  return {items, subtotal, delivery_fee, total_amount: subtotal + delivery_fee};
}
export function receipt(customer: Customer, items: OrderItem[]) {
  const subtotal = items.reduce((s,i) => s + i.price * i.quantity, 0);
  const fee = subtotal >= FREE_DELIVERY ? 0 : DELIVERY_FEE;
  const point=typeof customer.delivery_latitude==='number'&&typeof customer.delivery_longitude==='number'?{latitude:customer.delivery_latitude,longitude:customer.delivery_longitude}:null;
  return [STORE, 'GROCERY ORDER · Cash on Delivery', '', `Customer: ${customer.customer_name}`, `Phone: ${customer.customer_phone}`, `Area: ${customer.delivery_area}`, `Address: ${customer.delivery_address}`, ...(point?[`Delivery pin: ${deliveryPinUrl(point)}`,`Distance from store: ${deliveryDistanceKm(point).toFixed(2)} km · 5 km delivery radius`]:[]), '', ...items.map(i => `${i.quantity} × ${i.name} (${i.unit}) — ${money(i.quantity * i.price)}`), '', `Subtotal: ${money(subtotal)}`, `Delivery: ${money(fee)}`, `TOTAL COD: ${money(subtotal + fee)}`, '', 'Please confirm availability and delivery time.'].join('\n');
}
