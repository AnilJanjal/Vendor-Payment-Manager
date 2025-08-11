import type { Vendor } from "../types";

interface OnDemandPaymentsProps {
  vendors: Vendor[];
  account2Balance: number;
  onPayNow: (vendor: Vendor, options?: { secure?: boolean, skipNext?: boolean }) => void;
}

export default function OnDemandPayments({ vendors, account2Balance, onPayNow }: OnDemandPaymentsProps) {
  const onDemandVendors = vendors.filter(v => v.paymentType === "On-Demand");

  const payNow = (vendor: Vendor) => {
    // secure validation: simple confirm prompt (replaceable with PIN modal)
    const ok = window.confirm(`Confirm payment to ${vendor.name}? This is a secure validation step.`);
    if (!ok) return;
    // After secure confirmation, ask if they want to skip next scheduled payment (if vendor is scheduled later)
    const skip = window.confirm("If this vendor is scheduled, do you want to skip the next scheduled payment?");
    onPayNow(vendor, { secure: true, skipNext: skip });
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>On-Demand Payments</h2>
      <p>Account 2 balance: ${account2Balance.toFixed(2)}</p>
      <ul>
        {onDemandVendors.length === 0 && <li>No on-demand vendors</li>}
        {onDemandVendors.map(vendor => (
          <li key={vendor.id} style={{ marginBottom: 10 }}>
            {vendor.name} — Assigned to: {vendor.assignedAccount}
            <button style={{ marginLeft: 10 }} onClick={() => payNow(vendor)}>Pay Now</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
