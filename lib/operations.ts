import {z} from 'zod';
import {database} from './supabase';
import {fulfillmentOrder} from './fulfillment';
import type {Order} from './types';
import type {StaffActor,StaffRole} from './staff';

export type OperationalOrder=Order&{operation_version:number;approval_status:'pending'|'approved'|'rejected';approved_at:string|null;packed_at:string|null;assigned_rider_id:string|null;delivered_at:string|null;cash_confirmed:boolean;cash_received:number|null;settled_at:string|null;rejection_reason:string|null};
export const operationsFields='id,customer_name,customer_phone,delivery_area,delivery_address,delivery_latitude,delivery_longitude,delivery_distance_km,created_at,status,payment_method,subtotal,delivery_fee,total_amount,items,operation_version,approval_status,approved_at,packed_at,assigned_rider_id,delivered_at,cash_confirmed,cash_received,settled_at,rejection_reason';
export function operationalView(order:OperationalOrder):OperationalOrder{return {...fulfillmentOrder(order),operation_version:order.operation_version,approval_status:order.approval_status,approved_at:order.approved_at,packed_at:order.packed_at,assigned_rider_id:order.assigned_rider_id,delivered_at:order.delivered_at,cash_confirmed:order.cash_confirmed,cash_received:order.cash_received,settled_at:order.settled_at,rejection_reason:order.rejection_reason};}
export const actionSchema=z.object({id:z.string().regex(/^ORD-[\da-f-]{36}$/i),action:z.enum(['reject','start_pack','finish_pack','assign_rider','depart','deliver','settle']),expected_version:z.number().int().min(0),payload:z.object({delivery_verified:z.boolean().optional(),rider_id:z.string().uuid().optional(),reason:z.string().trim().min(3).max(400).optional(),cash_received:z.number().finite().nonnegative().max(9999999999.99).optional(),checked_items:z.array(z.object({product_id:z.string().uuid(),quantity:z.number().int().min(1).max(99)}).strict()).max(60).optional()}).strict().default({})}).strict();
const actions:Record<StaffRole|'owner',Set<string>>={owner:new Set(['reject','start_pack','finish_pack','assign_rider','depart','deliver','settle']),manager:new Set(['reject','settle']),packer:new Set(['start_pack','finish_pack']),rider:new Set(['start_pack','finish_pack','depart','deliver'])};
export function canPerform(role:StaffRole|'owner',action:string){return actions[role].has(action);}
export async function performAction(value:z.infer<typeof actionSchema>,actor:StaffActor|null,owner=false){
 const role=owner?'owner':actor?.role;if(!role||!canPerform(role,value.action))throw Object.assign(Error('Your role cannot perform this action.'),{status:403});
 const {data,error}=await database().rpc('perform_store_order_action',{p_order_id:value.id,p_action:value.action,p_expected_version:value.expected_version,p_role:role,p_staff_id:actor?.id??null,p_payload:value.payload});
 if(error)throw Object.assign(Error(error.message||'The order could not be updated.'),{status:/access|only|assigned to you|identity|revoked/i.test(error.message)?403:409});return data;
}
// Staff IDs are server-validated UUIDs. Keep the rider and cursor predicates together in one OR parameter.
// Riders also pack in small teams, so unclaimed orders still waiting to be packed are visible to them.
export function riderOrderAccess(staffId:string){return `assigned_rider_id.eq.${staffId},and(assigned_rider_id.is.null,status.eq.Packing,packed_at.not.is.null),and(assigned_rider_id.is.null,status.in.(Pending,Packing),packed_at.is.null)`;}
export async function listOperations(role:StaffRole|'owner',staffId:string|null,view:string,before?:{created_at:string;id:string}){
 let query=database().from('orders').select(operationsFields).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(201);
 const conditions:string[]=[];
 if(role==='rider')conditions.push(`or(${riderOrderAccess(staffId!)})`);
 if(view==='cash')query=query.eq('status','Delivered').eq('cash_confirmed',false);
 else if(view==='active'&&role==='packer')query=query.in('status',['Pending','Packing']).is('packed_at',null);
 else if(view==='active'&&role==='rider')query=query.in('status',['Pending','Packing','Out for Delivery','Delivered']).eq('cash_confirmed',false);
 else if(view==='active'){query=query.not('status','eq','Cancelled');conditions.push('or(status.neq.Delivered,cash_confirmed.eq.false)');}
 else if(view==='completed')conditions.push(role==='packer'?'or(packed_at.not.is.null,status.eq.Cancelled)':'or(cash_confirmed.eq.true,status.eq.Cancelled)');
 if(before)conditions.push(`or(created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id}))`);
 if(conditions.length)query=query.or(`and(${conditions.join(',')})`);
 const {data,error}=await query;if(error)throw error;
 return (data??[]).map(row=>operationalView(row as unknown as OperationalOrder));
}
export function operationError(error:unknown){if(error instanceof SyntaxError)return {error:'Invalid request body.',status:400};const e=error as {message?:string;status?:number};return {error:e.status?e.message:'The store could not complete this request. Refresh and try again.',status:e.status||503};}
