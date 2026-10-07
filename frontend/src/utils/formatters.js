/**
 * EquiShare Formatting & Localized Date Utilities
 */

/**
 * Formats a number as Indian Currency (e.g., ₹10,00,000.00)
 */
export function formatCurrency(amount, currency = '₹') {
  const num = Number(amount) || 0;
  return `${currency}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Returns local date in YYYY-MM-DD format (avoids UTC timezone shift)
 */
export function getLocalDateString(d = new Date()) {
  const date = typeof d === 'string' ? new Date(d) : d;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates authentic UPI ID format (e.g. rahul@okaxis, sneha@hdfcbank)
 */
export function isValidUpiId(upi) {
  if (!upi) return true; // optional
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upi.trim());
}

/**
 * Generates an authentic UPI Deep Link
 */
export function generateUpiDeepLink({ upiId, payeeUpiId, payeeName, amount, note = 'EquiShare Settlement' } = {}) {
  const targetUpi = upiId || payeeUpiId;
  if (!targetUpi) return null;
  const cleanUpi = encodeURIComponent(targetUpi.trim());
  const cleanName = encodeURIComponent(payeeName || 'Roommate');
  const cleanAmount = Number(amount).toFixed(2);
  const cleanNote = encodeURIComponent(note || 'EquiShare Settlement');
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}`;
}
