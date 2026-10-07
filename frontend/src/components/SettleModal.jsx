import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { 
  GPayLogo, 
  PhonePeLogo, 
  PaytmLogo, 
  SuperMoneyLogo, 
  BhimUpiLogo, 
  CashLogo 
} from './PaymentLogos';
import { generateUpiDeepLink, formatCurrency } from '../utils/formatters';

export function SettleModal({
  isOpen,
  onClose,
  debt,
  currency = '₹',
  defaultPaymentApp = 'gpay',
  onConfirmSettlement
}) {
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentApp || 'gpay');
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('Expense Settle Up');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && debt) {
      setPaymentMethod(defaultPaymentApp || 'gpay');
      setAmountInput(debt.amount ? debt.amount.toFixed(2) : '');
      setNote(`Settlement: ${debt.from?.name || 'Payer'} to ${debt.to?.name || 'Receiver'}`);
      setIsSuccess(false);
      setError('');
    }
  }, [isOpen, debt, defaultPaymentApp]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !debt) return null;

  const maxAmount = debt.amount || 0;
  const parsedAmount = parseFloat(amountInput) || 0;

  const methods = [
    { id: 'gpay', name: 'Google Pay', LogoComponent: GPayLogo, subtitle: 'Instant UPI' },
    { id: 'phonepe', name: 'PhonePe', LogoComponent: PhonePeLogo, subtitle: 'UPI / Wallet' },
    { id: 'paytm', name: 'Paytm UPI', LogoComponent: PaytmLogo, subtitle: 'Fast Payments' },
    { id: 'supermoney', name: 'super.money', LogoComponent: SuperMoneyLogo, subtitle: 'UPI Rewards' },
    { id: 'bhim_upi', name: 'BHIM UPI', LogoComponent: BhimUpiLogo, subtitle: 'National UPI' },
    { id: 'cash', name: 'Direct Cash', LogoComponent: CashLogo, subtitle: 'Hand-to-Hand' },
  ];

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    if (parsedAmount <= 0) {
      setError('Please enter a valid settlement amount greater than 0.');
      return;
    }
    if (parsedAmount > maxAmount + 0.01) {
      setError(`Settlement amount cannot exceed current outstanding debt (${currency}${maxAmount.toFixed(2)}).`);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onConfirmSettlement({
        from: debt.from.id,
        to: debt.to.id,
        amount: parsedAmount,
        method: paymentMethod,
        note: note.trim()
      });
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  // UPI deep link if receiver has a UPI ID
  const receiverUpi = debt.to?.upiId || '';
  const upiLink = receiverUpi 
    ? generateUpiDeepLink({
        payeeUpiId: receiverUpi,
        payeeName: debt.to?.name || 'Receiver',
        amount: parsedAmount,
        note: note || 'Settlement'
      })
    : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settle-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-lg bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center transition-all duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-white font-outfit">Payment Recorded Successfully!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Debt balances have been updated and simplified for your group.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-4">
              <h3 id="settle-modal-title" className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2 font-outfit">
                <span className="text-emerald-400">⚡</span> Settle Up Debt
              </h3>
              <p className="text-xs text-slate-400">Record payment using authentic Indian UPI & cash apps</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Debt Flow Banner */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <img src={debt.from?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={debt.from?.name} className="w-10 h-10 rounded-full object-cover border-2 border-rose-500/40" />
                <div>
                  <span className="text-xs font-bold text-white block">{debt.from?.name}</span>
                  <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Payer</span>
                </div>
              </div>

              <div className="flex flex-col items-center px-2">
                <span className="text-base font-mono font-extrabold text-emerald-400">
                  {formatCurrency(debt.amount, currency)}
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-400 mt-0.5" />
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{debt.to?.name}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Receiver</span>
                </div>
                <img src={debt.to?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={debt.to?.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/40" />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {methods.map((m) => {
                  const Logo = m.LogoComponent;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="shrink-0 bg-white/5 p-1.5 rounded-lg border border-white/5 flex items-center justify-center">
                        <Logo size={22} />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                          {m.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">{m.subtitle}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UPI Deep Link Action if available */}
            {paymentMethod !== 'cash' && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-emerald-300 block truncate">
                    {receiverUpi ? `Pay to: ${receiverUpi}` : 'No UPI ID saved for receiver'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {receiverUpi ? 'Opens your default UPI app directly on mobile' : 'Receiver can add their UPI ID in Group Settings'}
                  </span>
                </div>
                {upiLink && (
                  <a
                    href={upiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-400 transition-colors shadow-sm"
                  >
                    <span>Pay Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Settle Amount & Note */}
            <div className="space-y-3 mb-5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-400">Amount to Settle ({currency})</label>
                  <span className="text-[10px] text-slate-500 font-mono">Max: {currency}{maxAmount.toFixed(2)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={maxAmount}
                    value={amountInput}
                    onChange={(e) => {
                      setAmountInput(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Payment Reference / Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Paid via GPay / PhonePe for groceries"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={parsedAmount <= 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Record Settle Up</span>
                <span className="font-mono">({formatCurrency(parsedAmount, currency)})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

