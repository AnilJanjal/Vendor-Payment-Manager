import type { Payment } from "../types";

interface PendingPaymentsProps {
  payments: Payment[];
  onRetry: (payment: Payment) => Promise<void>;
}

export default function PendingPayments({ payments, onRetry }: PendingPaymentsProps) {
  const pending = payments.filter(p => p.status === "Pending");

  if (pending.length === 0) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Pending Payments</h3>
      <ul>
        {pending.map(p => (
          <li key={p.id}>
            {p.vendorName} — ${p.amount.toFixed(2)} — {new Date(p.date).toLocaleString()}
            <button style={{ marginLeft: 10 }} onClick={() => onRetry(p)}>Retry</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
