import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'valle-express-balance';

export function useWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [lastRecharge, setLastRecharge] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBalance(parsed.balance ?? 0);
        setLastRecharge(parsed.lastRecharge ?? null);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const persist = useCallback((newBalance: number, ts: number | null) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance: newBalance, lastRecharge: ts }));
    } catch {
      // ignore
    }
  }, []);

  const recharge = useCallback(
    (amount: number) => {
      setBalance((prev) => {
        const next = prev + amount;
        persist(next, Date.now());
        return next;
      });
      setLastRecharge(Date.now());
    },
    [persist],
  );

  const reset = useCallback(() => {
    setBalance(0);
    setLastRecharge(null);
    persist(0, null);
  }, [persist]);

  return { balance, lastRecharge, recharge, reset };
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
