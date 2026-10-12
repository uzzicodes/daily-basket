export const STORE = 'Askari Departmental Store Lahore';
export const STORE_WHATSAPP_DEFAULT = '923084555567';
export const FREE_DELIVERY = 2999;
export const DELIVERY_FEE = 150;
export const AREAS = [...Array.from({length: 8}, (_,i) => `DHA Phase ${i + 1}`), 'Johar Town', 'Model Town', 'Gulberg', 'Bahria Town', 'Cantt', 'Wapda Town', 'Faisal Town'];
export const CATEGORIES = ['Cooking & Pantry', 'Dairy, Milk & Breakfast', 'Tea, Coffee & Beverages', 'Spices & Recipe Mixes', 'Snacks & Confectionery', 'Laundry & Detergents', 'Household & Cleaning', 'Baby Care', 'Personal Care & Hygiene'];
export const CATEGORY_SHORT = ['Pantry essentials', 'Dairy & breakfast', 'Tea & beverages', 'Spices & mixes', 'Snacks & treats', 'Laundry care', 'Home & cleaning', 'Baby care', 'Personal care'];
export const money = (value: number) => `Rs. ${new Intl.NumberFormat('en-PK', {maximumFractionDigits: 0}).format(value)}`;
