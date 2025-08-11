import type { Payment } from "../types";

interface PendingPaymentsProps {
  payments: Payment[];
  onRetry: (payment: Payment) => Promise<void>;
}

export default function PendingPayments({ payments, onRetry }: PendingPaymentsProps) {
  const pending = payments.filter((p) => p.status === "Pending");

  if (pending.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Pending Payments</h3>

      <ul className="space-y-4">
        {pending.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors"
          >
            <div>
              <span className="block font-semibold text-gray-800">{p.vendorName}</span>
              <span className="block text-gray-600">
                ${p.amount.toFixed(2)} — {new Date(p.date).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onRetry(p)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Retry
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
