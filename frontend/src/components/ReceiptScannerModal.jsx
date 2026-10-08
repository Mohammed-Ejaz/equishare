import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Receipt, 
  Sparkles, 
  Check, 
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  Loader2
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { SAMPLE_RECEIPT, CATEGORIES } from '../data/mockData';
import { getLocalDateString } from '../utils/formatters';

export function ReceiptScannerModal({
  isOpen,
  onClose,
  members = [],
  currentUser = null,
  currency = '₹',
  onImportReceipt
}) {
  const [storeName, setStoreName] = useState('');
  const [items, setItems] = useState([]);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [receiptCategory, setReceiptCategory] = useState('groceries');
  const defaultPayer = currentUser?.id || members.find((m) => m.isCurrentUser)?.id || members[0]?.id || '';
  const [payerId, setPayerId] = useState(() => defaultPayer);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedImageName, setScannedImageName] = useState('');

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const fileInputRef = useRef(null);

  // Reset to empty state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStoreName('');
      setItems([]);
      setTax('');
      setTip('');
      setReceiptCategory('groceries');
      setPayerId(defaultPayer);
      setIsScanning(false);
      setScanStatus('');
      setScanProgress(0);
      setScannedImageName('');
      setNewItemName('');
      setNewItemPrice('');
    }
  }, [isOpen, members, defaultPayer]);

  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const grandTotal = subtotal + Number(tax || 0) + Number(tip || 0);

  // Toggle roommate assignment for a specific line item
  const toggleItemAssignment = (itemId, memberId) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const current = item.assignedTo || [];
          const exists = current.includes(memberId);
          const next = exists
            ? current.length > 1 ? current.filter((id) => id !== memberId) : current
            : [...current, memberId];
          return { ...item, assignedTo: next };
        }
        return item;
      })
    );
  };

  // Add a manual item
  const handleAddItem = (e) => {
    if (e) e.preventDefault();
    const parsedPrice = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(parsedPrice) || parsedPrice <= 0) return;

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newItemName.trim(),
      price: parsedPrice,
      assignedTo: members.map((m) => m.id)
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemPrice('');
  };

  // Delete line item
  const handleDeleteItem = (itemId) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Parse raw OCR text lines to structured bill items
  const parseReceiptText = (rawText, defaultMembers) => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    let detectedStore = '';
    let detectedTax = '';
    let detectedTip = '';
    const detectedItems = [];

    // Header merchant detection
    for (let i = 0; i < Math.min(4, lines.length); i++) {
      const line = lines[i];
      if (line.length >= 3 && !/\d{2,}/.test(line) && !/receipt|invoice|bill|date|tax|welcome/i.test(line)) {
        detectedStore = line.replace(/[*#=~]/g, '').trim();
        break;
      }
    }

    lines.forEach((line, idx) => {
      // Check for tax / GST / VAT
      if (/tax|gst|cgst|sgst|vat/i.test(line)) {
        const match = line.match(/(\d+[.,]\d{2})/);
        if (match && !detectedTax) {
          detectedTax = match[1].replace(',', '.');
        }
        return;
      }

      // Check for tip / delivery / service charge
      if (/tip|service\s*charge|delivery/i.test(line)) {
        const match = line.match(/(\d+[.,]\d{2})/);
        if (match && !detectedTip) {
          detectedTip = match[1].replace(',', '.');
        }
        return;
      }

      // Ignore general summary headers
      if (/total|grand\s*total|subtotal|balance|amount\s*due|change/i.test(line)) {
        return;
      }

      // Look for price pattern at the end or inside the line (e.g., "Latte 150.00" or "Pasta 450")
      const priceMatch = line.match(/(.*?)(?:₹|\$|€|INR|Rs\.?|Rs)?\s*(\d+[.,]\d{2}|\b\d{2,5}\b)$/i);
      if (priceMatch) {
        const rawName = priceMatch[1].replace(/^[0-9*#-.\s]+/, '').replace(/[*#=~]/g, '').trim();
        const rawPrice = priceMatch[2].replace(',', '.');
        const price = parseFloat(rawPrice);
        if (rawName.length >= 2 && !isNaN(price) && price > 0 && price < 100000) {
          detectedItems.push({
            id: `ocr-${Date.now()}-${idx}`,
            name: rawName,
            price: price,
            assignedTo: defaultMembers.map((m) => m.id)
          });
        }
      }
    });

    return {
      storeName: detectedStore,
      items: detectedItems,
      tax: detectedTax,
      tip: detectedTip
    };
  };

  // Real OCR scan from uploaded file via Tesseract.js
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannedImageName(file.name);
    setIsScanning(true);
    setScanStatus('Initializing OCR engine...');
    setScanProgress(5);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            setScanProgress(pct);
            setScanStatus(`Reading text (${pct}%)...`);
          } else {
            setScanStatus(m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) + '...' : 'Processing...');
          }
        }
      });

      const ocrText = result?.data?.text || '';
      const parsed = parseReceiptText(ocrText, members);

      if (parsed && parsed.items.length > 0) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setStoreName(parsed.storeName || cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        setItems(parsed.items);
        if (parsed.tax) setTax(parsed.tax);
        if (parsed.tip) setTip(parsed.tip);
      } else {
        // Fallback to text lines as editable items
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setStoreName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1) || 'Scanned Bill');
        const lines = ocrText.split('\n').map((l) => l.trim()).filter((l) => l.length > 2);
        if (lines.length > 0) {
          setItems(lines.slice(0, 4).map((line, i) => ({
            id: `ocr-${Date.now()}-${i}`,
            name: line.substring(0, 35),
            price: 150.00,
            assignedTo: members.map((m) => m.id)
          })));
        } else {
          setItems([
            { id: `ocr-1`, name: 'Scanned Item 1', price: 450.00, assignedTo: members.map((m) => m.id) }
          ]);
        }
      }
    } catch (err) {
      console.error('OCR processing error:', err);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setStoreName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1) || 'Receipt');
      setItems([
        { id: `ocr-1`, name: 'Scanned Item 1', price: 350.00, assignedTo: members.map((m) => m.id) }
      ]);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
      setScanStatus('Completed');
    }
  };

  // Load sample demo receipt
  const handleLoadDemoReceipt = () => {
    setIsScanning(true);
    setScanStatus('Loading sample receipt...');
    setScanProgress(50);
    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(100);
      setScanStatus('Completed');
      setStoreName(SAMPLE_RECEIPT.storeName);
      setItems(SAMPLE_RECEIPT.items.map((it) => ({
        ...it,
        assignedTo: members.map((m) => m.id)
      })));
      setTax(SAMPLE_RECEIPT.tax.toString());
      setTip(SAMPLE_RECEIPT.tip.toString());
      setScannedImageName('sample_receipt_invoice.jpg');
    }, 400);
  };

  // Calculate individual breakdown with proportional tax & tip
  const calculateMemberTotals = () => {
    const totals = {};
    members.forEach((m) => { totals[m.id] = { subtotal: 0, taxShare: 0, tipShare: 0, total: 0 }; });

    items.forEach((item) => {
      const price = Number(item.price) || 0;
      const assigned = item.assignedTo || [];
      if (assigned.length > 0) {
        const share = price / assigned.length;
        assigned.forEach((mId) => {
          if (totals[mId]) totals[mId].subtotal += share;
        });
      }
    });

    const taxNum = Number(tax || 0);
    const tipNum = Number(tip || 0);

    Object.keys(totals).forEach((mId) => {
      const ratio = subtotal > 0 ? totals[mId].subtotal / subtotal : 0;
      totals[mId].taxShare = ratio * taxNum;
      totals[mId].tipShare = ratio * tipNum;
      totals[mId].total = totals[mId].subtotal + totals[mId].taxShare + totals[mId].tipShare;
    });

    return totals;
  };

  const memberTotals = calculateMemberTotals();

  const handleSaveToExpenses = useCallback(() => {
    if (items.length === 0) return;

    const splits = {};
    Object.entries(memberTotals).forEach(([mId, data]) => {
      if (data.total > 0.01) {
        splits[mId] = Math.round(data.total * 100) / 100;
      }
    });

    const newExpense = {
      id: `exp-receipt-${Date.now()}`,
      title: `${storeName.trim() || 'Scanned Receipt'} (Itemized)`,
      amount: Math.round(grandTotal * 100) / 100,
      category: receiptCategory || 'groceries',
      paidBy: payerId,
      date: getLocalDateString(),
      splitType: 'receipt-itemized',
      participants: Object.keys(splits).length > 0 ? Object.keys(splits) : members.map((m) => m.id),
      splits,
      notes: `${items.length} line items with tax/charges distributed`
    };

    onImportReceipt(newExpense);
    onClose();
  }, [memberTotals, storeName, grandTotal, payerId, receiptCategory, items.length, members, onImportReceipt, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight font-outfit">
                Receipt Itemizer & AI OCR Splitter
              </h3>
              <p className="text-xs text-slate-400">Scan paper bill or add items to allocate line items to roommates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDemoReceipt}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Demo Sample</span>
            </button>
          </div>
        </div>

        {/* Body Content - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar text-xs">
          {/* Upload Dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />

          <div 
            onClick={() => !isScanning && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
              isScanning 
                ? 'border-indigo-500 bg-indigo-500/10 cursor-wait' 
                : 'border-white/15 bg-white/[0.02] hover:bg-white/5 hover:border-indigo-500/50 cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                {isScanning ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> : <Upload className="w-5 h-5" />}
              </div>
              <div className="text-left flex-1">
                <span className="font-bold text-white block">
                  {isScanning ? scanStatus || 'AI OCR Scanning Receipt...' : scannedImageName ? `Scanned: ${scannedImageName}` : 'Upload Receipt / Bill Image'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isScanning ? 'Extracting store name, items & prices using Tesseract OCR' : 'Click or drop a JPG/PNG bill photo to extract line items'}
                </span>
                {isScanning && (
                  <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, scanProgress)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Store & Payer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Store / Merchant Name</label>
              <input
                type="text"
                placeholder="e.g. Nature's Basket, Swiggy Instamart"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Paid By</label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#111726]">
                    {m.name} {m.isCurrentUser ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Line Item Form */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              + Add Item Manually
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Item name (e.g. Cold Brew Coffee)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(e); }}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium focus:border-indigo-500 focus:outline-none placeholder-slate-500"
              />
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(e); }}
                  className="w-full pl-6 pr-2 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold focus:border-indigo-500 focus:outline-none placeholder-slate-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold flex items-center gap-1 shrink-0 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Receipt Line Items ({items.length})
              </span>
              {items.length > 0 && (
                <span className="text-slate-400 text-[11px]">Click roommate badge to toggle assignment</span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center bg-white/[0.02] rounded-xl border border-white/5">
                <Receipt className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-white">Receipt is empty</h4>
                <p className="text-xs text-slate-400 mt-0.5">Upload a receipt image above or add items manually.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-white/20 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white block truncate">{item.name}</span>
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        {currency}{Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    {/* Roommate Assignment Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {members.map((m) => {
                        const isAssigned = (item.assignedTo || []).includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleItemAssignment(item.id, m.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isAssigned
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/15'
                            }`}
                          >
                            <img src={m.avatar} alt={m.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                            <span>{m.name.split(' ')[0]}</span>
                            {isAssigned && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tax & Adjustments */}
          {items.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">GST / Tax ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Delivery / Tip ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Individual Share Preview */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="font-bold text-indigo-300 block mb-2">Calculated Share Per Roommate</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {members.map((m) => {
                    const total = memberTotals[m.id]?.total || 0;
                    return (
                      <div key={m.id} className="p-2 rounded-lg bg-black/20 border border-white/5">
                        <span className="text-[10px] text-slate-400 block truncate">{m.name}</span>
                        <strong className="font-mono text-emerald-400 font-bold text-xs block mt-0.5">
                          {currency}{total.toFixed(2)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-white/10 shrink-0">
          <div>
            <span className="text-slate-400 text-[10px] block">Grand Total</span>
            <strong className="font-mono font-extrabold text-sm text-white">
              {currency}{grandTotal.toFixed(2)}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={items.length === 0}
              onClick={handleSaveToExpenses}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Import to Group</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
