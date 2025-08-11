import type { Vendor } from "../types";

interface OnDemandPaymentsProps {
  vendors: Vendor[];
  account2Balance: number;
  onPayNow: (vendor: Vendor, options?: { secure?: boolean; skipNext?: boolean }) => void;
}

export default function OnDemandPayments({
  vendors,
  account2Balance,
  onPayNow,
}: OnDemandPaymentsProps) {
  const onDemandVendors = vendors.filter((v) => v.paymentType === "On-Demand");

  const payNow = (vendor: Vendor) => {
    const ok = window.confirm(
      `Confirm payment to ${vendor.name}? This is a secure validation step.`
    );
    if (!ok) return;
    const skip = window.confirm(
      "If this vendor is scheduled, do you want to skip the next scheduled payment?"
    );
    onPayNow(vendor, { secure: true, skipNext: skip });
  };

  return (
    <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-xl p-6 mt-8 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-3">On-Demand Payments</h2>
      <p className="text-gray-600 mb-4">
        Account 2 Balance:{" "}
        <span className="font-semibold text-green-600">
          ${account2Balance.toFixed(2)}
        </span>
      </p>

      {onDemandVendors.length === 0 ? (
        <p className="text-gray-500 italic">No on-demand vendors</p>
      ) : (
        <ul className="space-y-3">
          {onDemandVendors.map((vendor) => (
            <li
              key={vendor.id}
              className="flex items-center justify-between bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-lg shadow-sm"
            >
              <span className="text-gray-800">
                <span className="font-medium">{vendor.name}</span> — Assigned to:{" "}
                <span className="text-gray-600">{vendor.assignedAccount}</span>
              </span>
              <button
                onClick={() => payNow(vendor)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg shadow transition-all duration-200 active:scale-95"
              >
                Pay Now
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
