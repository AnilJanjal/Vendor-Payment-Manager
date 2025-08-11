import { useState } from "react";
import type { Payment } from "../types";

interface PaymentsHistoryProps {
  payments: Payment[];
  vendorsList: { id: string; name: string }[];
}

export default function PaymentsHistory({ payments, vendorsList }: PaymentsHistoryProps) {
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const filtered = payments.filter((p) => {
    if (vendorFilter !== "all" && p.vendorId !== vendorFilter) return false;
    if (fromDate && new Date(p.date) < new Date(fromDate)) return false;
    if (toDate && new Date(p.date) > new Date(toDate)) return false;
    return true;
  });

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Payments History</h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Vendor</label>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All</option>
            {vendorsList.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600">Vendor</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600">Amount</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600">Date</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-2 text-sm font-semibold text-gray-600">Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2">{p.vendorName}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">${p.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">{new Date(p.date).toLocaleString()}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      p.status === "Completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {p.status}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No payments found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
