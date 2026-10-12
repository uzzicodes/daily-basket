import { z } from 'zod';
import type { Order } from './types';

export const ORDER_PAGE_SIZE = 200;
const cursorSchema = z.object({
  created_at: z.string().datetime({ offset: true }),
  id: z.string().regex(/^ORD-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
}).strict();

export function decodeOrderCursor(value: string) {
  if (value.length > 400 || !/^[A-Za-z0-9_-]+$/.test(value)) throw Error('Invalid page cursor.');
  return cursorSchema.parse(JSON.parse(Buffer.from(value, 'base64url').toString('utf8')));
}

export function orderPage(rows: Order[]) {
  const orders = rows.slice(0, ORDER_PAGE_SIZE);
  const last = orders.at(-1);
  const nextCursor = rows.length > ORDER_PAGE_SIZE && last
    ? Buffer.from(JSON.stringify({ created_at: last.created_at, id: last.id })).toString('base64url')
    : null;
  return { orders, nextCursor };
}
