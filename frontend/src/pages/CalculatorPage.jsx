import React, { useState } from 'react';
import { 
  Calculator as CalcIcon, 
  History, 
  Sparkles, 
  Plus
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Safe tokenizer & evaluator for standard arithmetic (+, -, *, /)
function evaluateArithmetic(expr) {
  // Normalize tokens
  const clean = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');

  // Tokenize numbers and operators
  const tokens = clean.match(/(\d+\.?\d*|[-+*/])/g);
  if (!tokens || tokens.length === 0) return 0;

  // Handle leading negative numbers or consecutive operators
  const parsedTokens = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '-' && (i === 0 || ['+', '-', '*', '/'].includes(tokens[i - 1]))) {
      const nextNum = tokens[i + 1];
      if (nextNum && !['+', '-', '*', '/'].includes(nextNum)) {
        parsedTokens.push(-parseFloat(nextNum));
        i++;
      } else {
        parsedTokens.push(tokens[i]);
      }
    } else if (!isNaN(parseFloat(tokens[i]))) {
      parsedTokens.push(parseFloat(tokens[i]));
    } else {
      parsedTokens.push(tokens[i]);
    }
  }

  // Pass 1: Handle * and / with full IEEE-754 precision
  const pass1 = [];
  for (let i = 0; i < parsedTokens.length; i++) {
    const token = parsedTokens[i];
    if (token === '*' || token === '/') {
      const prev = pass1.pop();
      const next = parsedTokens[++i];
      if (typeof prev !== 'number' || typeof next !== 'number') return 0;
      if (token === '/' && next === 0) {
        throw new Error('Division by zero');
      }
      pass1.push(token === '*' ? prev * next : prev / next);
    } else {
      pass1.push(token);
    }
  }

  // Pass 2: Handle + and -
  let result = typeof pass1[0] === 'number' ? pass1[0] : 0;
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i];
    const next = pass1[i + 1];
    if (typeof next !== 'number') break;
    if (op === '+') result += next;
    if (op === '-') result -= next;
  }

  return result;
}

export function CalculatorPage({
  currency = '₹',
  onOpenAddExpenseWithAmount
}) {
  const [display, setDisplay] = useState('0');
  const [pendingEquation, setPendingEquation] = useState('');
  const [justCalculated, setJustCalculated] = useState(false);
  const [history, setHistory] = useState([]);

  const handleDigit = (digit) => {
    if (justCalculated || display === 'Error' || display === 'Cannot ÷ by 0') {
      setDisplay(digit === '.' ? '0.' : digit);
      setJustCalculated(false);
      return;
    }

    if (display === '0' && digit !== '.') {
      setDisplay(digit);
    } else if (digit === '.' && display.includes('.')) {
      return;
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op) => {
    if (display === 'Error' || display === 'Cannot ÷ by 0') {
      handleClear();
      return;
    }

    if (op === '%') {
      const current = parseFloat(display) || 0;
      const pctValue = current / 100;
      setDisplay(String(pctValue));
      return;
    }

    if (justCalculated && pendingEquation) {
      // User pressed operator right after another operator: simply replace operator
      setPendingEquation(`${display} ${op} `);
      return;
    }

    if (pendingEquation) {
      // Chain calculation without premature rounding
      try {
        const fullEq = pendingEquation + display;
        const subResult = evaluateArithmetic(fullEq);
        setPendingEquation(`${subResult} ${op} `);
        setDisplay(String(subResult));
      } catch {
        setPendingEquation(`${display} ${op} `);
      }
    } else {
      setPendingEquation(`${display} ${op} `);
    }
    setJustCalculated(true);
  };

  const handleCalculate = () => {
    if (!pendingEquation) return;

    try {
      const fullEq = pendingEquation + display;
      const result = evaluateArithmetic(fullEq);
      
      if (!isFinite(result)) {
        setDisplay('Error');
        setPendingEquation('');
        setJustCalculated(true);
        return;
      }

      // Format result with clean precision (up to 4 decimals if fractional)
      const formatted = Number.isInteger(result) ? String(result) : String(Math.round(result * 10000) / 10000);
      setHistory([{ eq: fullEq, res: formatted }, ...history.slice(0, 9)]);
      setDisplay(formatted);
      setPendingEquation('');
      setJustCalculated(true);
    } catch (err) {
      if (err.message === 'Division by zero') {
        setDisplay('Cannot ÷ by 0');
      } else {
        setDisplay('Error');
      }
      setPendingEquation('');
      setJustCalculated(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPendingEquation('');
    setJustCalculated(false);
  };

  const handleBackspace = () => {
    if (justCalculated || display === 'Error' || display === 'Cannot ÷ by 0') {
      handleClear();
      return;
    }

    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const currentNumericValue = parseFloat(display) || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Page Header */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-400 text-white font-bold shadow-lg shadow-indigo-500/20">
              <CalcIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Calculator Studio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate total bills, split amounts, and seamlessly send the result directly to Add Expense
              </p>
            </div>
          </div>

          {currentNumericValue > 0 && onOpenAddExpenseWithAmount && (
            <button
              onClick={() => onOpenAddExpenseWithAmount(currentNumericValue)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Turn into Expense ({formatCurrency(currentNumericValue, currency)})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Calculator & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Calculator Keypad */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-2xl">
          {/* Display screen */}
          <div className="p-4 rounded-2xl bg-[#090D18] border border-white/10 mb-5 text-right flex flex-col justify-between min-h-[100px]">
            <span className="text-xs font-mono text-slate-400 min-h-[16px]">
              {pendingEquation || ' '}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-tight break-all">
              {display}
            </div>
          </div>

          {/* Keypad Buttons */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={handleClear}
              className="p-3.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-sm transition-all active:scale-95"
            >
              AC
            </button>
            <button
              onClick={handleBackspace}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-sm transition-all active:scale-95"
            >
              ⌫
            </button>
            <button
              onClick={() => handleOperator('%')}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-sm transition-all active:scale-95"
            >
              %
            </button>
            <button
              onClick={() => handleOperator('÷')}
              className="p-3.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-bold text-lg transition-all active:scale-95"
            >
              ÷
            </button>

            {['7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base transition-all active:scale-95"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOperator('×')}
              className="p-3.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-bold text-lg transition-all active:scale-95"
            >
              ×
            </button>

            {['4', '5', '6'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base transition-all active:scale-95"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOperator('−')}
              className="p-3.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-bold text-lg transition-all active:scale-95"
            >
              −
            </button>

            {['1', '2', '3'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base transition-all active:scale-95"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOperator('+')}
              className="p-3.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-bold text-lg transition-all active:scale-95"
            >
              +
            </button>

            <button
              onClick={() => handleDigit('0')}
              className="col-span-2 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base transition-all active:scale-95"
            >
              0
            </button>
            <button
              onClick={() => handleDigit('.')}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base transition-all active:scale-95"
            >
              .
            </button>
            <button
              onClick={handleCalculate}
              className="p-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              =
            </button>
          </div>
        </div>

        {/* Right: Calculation History & Quick Action */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" /> Recent Calculations
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Calculations will appear here for easy reference.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {history.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2 hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => { setDisplay(h.res); setPendingEquation(''); }}
                  >
                    <span className="text-xs font-mono text-slate-400 truncate">{h.eq} =</span>
                    <strong className="text-sm font-mono font-bold text-emerald-400">{h.res}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Pro Tip:
            </span>
            Click on any history item to reload its result onto the keypad display.
          </div>
        </div>
      </div>
    </div>
  );
}
