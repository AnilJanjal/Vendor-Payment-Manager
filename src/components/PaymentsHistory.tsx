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

  const filtered = payments.filter(p => {
    if (vendorFilter !== "all" && p.vendorId !== vendorFilter) return false;
    if (fromDate && new Date(p.date) < new Date(fromDate)) return false;
    if (toDate && new Date(p.date) > new Date(toDate)) return false;
    return true;
  });

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Payments History</h2>

      <div>
        <label>
          Vendor:
          <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
            <option value="all">All</option>
            {vendorsList.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </label>

        <label style={{ marginLeft: 10 }}>
          From:
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </label>
        <label style={{ marginLeft: 10 }}>
          To:
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </label>
      </div>

      <table border={1} cellPadding={5} style={{ borderCollapse: "collapse", width: "100%", marginTop: 10 }}>
        <thead>
          <tr><th>Vendor</th><th>Amount</th><th>Date</th><th>Status</th><th>Type</th></tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id}>
              <td>{p.vendorName}</td>
              <td>${p.amount.toFixed(2)}</td>
              <td>{new Date(p.date).toLocaleString()}</td>
              <td>{p.status}</td>
              <td>{p.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
