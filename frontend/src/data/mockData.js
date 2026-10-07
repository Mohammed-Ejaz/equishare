export const INITIAL_USERS = [];

export const INITIAL_GROUPS = [];

export const CATEGORIES = [
  { id: 'rent', label: 'Rent & Housing', icon: 'Home', color: '#10B981', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  { id: 'utilities', label: 'Utilities & WiFi', icon: 'Zap', color: '#F59E0B', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  { id: 'groceries', label: 'Groceries & Food', icon: 'ShoppingCart', color: '#3B82F6', bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { id: 'dining', label: 'Dining Out & Drinks', icon: 'Utensils', color: '#EC4899', bg: 'bg-pink-500/10 border-pink-500/30 text-pink-400' },
  { id: 'household', label: 'Household & Cleaning', icon: 'Sparkles', color: '#8B5CF6', bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { id: 'transport', label: 'Transport & Gas', icon: 'Car', color: '#06B6D4', bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
  { id: 'entertainment', label: 'Entertainment & Trips', icon: 'Film', color: '#F43F5E', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400' },
  { id: 'other', label: 'General / Other', icon: 'Tag', color: '#94A3B8', bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400' },
];

export const SAMPLE_RECEIPT = {
  storeName: "Supermarket & Cafe",
  date: new Date().toISOString().split('T')[0],
  items: [
    { id: 'it-1', name: 'Organic Milk Pack (2L)', price: 180.00, assignedTo: [] },
    { id: 'it-2', name: 'Fresh Artisan Sourdough Loaf', price: 220.00, assignedTo: [] },
    { id: 'it-3', name: 'Pantry Supplies & Snacks', price: 340.00, assignedTo: [] },
    { id: 'it-4', name: 'Fruits & Vegetables Basket', price: 299.00, assignedTo: [] },
    { id: 'it-5', name: 'Artisanal Coffee Beans 250g', price: 580.00, assignedTo: [] }
  ],
  subtotal: 1619.00,
  tax: 81.00,
  tip: 0.00,
  total: 1700.00
};
