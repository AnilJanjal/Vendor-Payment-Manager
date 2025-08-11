// src/components/MainApp.tsx
import { useState, useEffect } from "react";
import VendorList from "./VendorList";
import OnDemandPayments from "./OnDemandPayments";
import PaymentsHistory from "./PaymentsHistory";
import PendingPayments from "./PendingPayments";
import type { Vendor, Payment } from "../types";

import {
  readVendorsFromSheet,
  writeVendorsToSheet,
  readPaymentsFromSheet,
  writePaymentsToSheet,
  readBalancesFromSheet,
  writeBalancesToSheet,
  writeReportToSheet,
} from "../services/ExcelService";

export default function MainApp({ onLogout }: { onLogout: () => void }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [account1Balance, setAccount1Balance] = useState(200000);
  const [account2Balance, setAccount2Balance] = useState(200000);
  const [paymentsHistory, setPaymentsHistory] = useState<Payment[]>([]);
  const [reportPreview, setReportPreview] = useState<{
    account1: number;
    account2: number;
    completedPayments: Payment[];
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const v = await readVendorsFromSheet();
        if (v && v.length > 0) {
          setVendors(v);
          localStorage.setItem("vendors", JSON.stringify(v));
        } else {
          const stored = localStorage.getItem("vendors");
          if (stored) {
            const localVendors = JSON.parse(stored);
            setVendors(localVendors);
            if (localVendors.length > 0) {
              await writeVendorsToSheet(localVendors);
            }
          }
        }

        const p = await readPaymentsFromSheet();
        if (p && p.length > 0) {
          setPaymentsHistory(p);
          localStorage.setItem("paymentsHistory", JSON.stringify(p));
        } else {
          const storedP = localStorage.getItem("paymentsHistory");
          if (storedP) setPaymentsHistory(JSON.parse(storedP));
        }

        const balances = await readBalancesFromSheet();
        if (balances) {
          setAccount1Balance(balances.account1);
          setAccount2Balance(balances.account2);
          localStorage.setItem("account1Balance", balances.account1.toString());
          localStorage.setItem("account2Balance", balances.account2.toString());
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem("vendors", JSON.stringify(vendors));
    writeVendorsToSheet(vendors).catch(e => console.error("writeVendorsToSheet", e));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem("paymentsHistory", JSON.stringify(paymentsHistory));
    writePaymentsToSheet(paymentsHistory).catch(e => console.error("writePaymentsToSheet", e));
  }, [paymentsHistory]);

  useEffect(() => {
    localStorage.setItem("account1Balance", account1Balance.toString());
    localStorage.setItem("account2Balance", account2Balance.toString());
    writeBalancesToSheet(account1Balance, account2Balance).catch(e => console.error("writeBalancesToSheet", e));
  }, [account1Balance, account2Balance]);

  const findVendor = (id: string) => vendors.find(v => v.id === id);

  const onPayNow = async (vendor: Vendor) => {
    const amount = 200;
    let sufficient = false;

    if (vendor.assignedAccount === "Account 2") {
      if (account2Balance >= amount) {
        setAccount2Balance(prev => prev - amount);
        sufficient = true;
      }
    } else {
      if (account1Balance >= amount) {
        setAccount1Balance(prev => prev - amount);
        sufficient = true;
      }
    }

    const newPayment: Payment = {
      id: Date.now().toString(),
      vendorId: vendor.id,
      vendorName: vendor.name,
      amount,
      date: new Date().toISOString(),
      status: sufficient ? "Completed" : "Pending",
      type: "On-Demand",
    };

    setPaymentsHistory(prev => [...prev, newPayment]);
    alert(sufficient ? `Paid $${amount} to ${vendor.name}` : `Insufficient funds for ${vendor.name}. Payment pending.`);
  };

  const runScheduledPayments = () => {
    alert("Scheduled Payments logic here");
  };

  const retryPending = async (payment: Payment) => {
    alert(`Retry payment for ${payment.vendorName}`);
  };

  const generateReport = async () => {
    setReportPreview({
      account1: account1Balance,
      account2: account2Balance,
      completedPayments: paymentsHistory.filter(p => p.status === "Completed"),
    });
    await writeReportToSheet(account1Balance, account2Balance, paymentsHistory, vendors);
    alert("Report generated!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow rounded-xl p-4">
          <h1 className="text-2xl font-bold text-gray-800">💳 Vendor Payment Dashboard</h1>
          <button 
            onClick={onLogout} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow">
            Logout
          </button>
        </header>

        {/* Balances */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-100 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-green-800">Account 1 Balance</h2>
            <p className="text-3xl font-bold text-green-900 mt-2">${account1Balance.toFixed(2)}</p>
          </div>
          <div className="bg-blue-100 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-blue-800">Account 2 Balance</h2>
            <p className="text-3xl font-bold text-blue-900 mt-2">${account2Balance.toFixed(2)}</p>
          </div>
        </section>

        {/* Vendor List */}
        <div className="bg-white rounded-xl shadow p-6">
          <VendorList vendors={vendors} setVendors={setVendors} />
        </div>

        {/* On Demand Payments */}
        <div className="bg-white rounded-xl shadow p-6">
          <OnDemandPayments vendors={vendors} account2Balance={account2Balance} onPayNow={onPayNow} />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={runScheduledPayments}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg shadow">
            Run Scheduled Payments
          </button>
          <button 
            onClick={generateReport}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg shadow">
            Generate Report
          </button>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow p-6">
          <PaymentsHistory payments={paymentsHistory} vendorsList={vendors.map(v => ({ id: v.id, name: v.name }))} />
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow p-6">
          <PendingPayments payments={paymentsHistory} onRetry={retryPending} />
        </div>

        {/* Report Preview */}
        {reportPreview && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-2">📄 Report Preview</h3>
            <p className="text-sm text-gray-600">Generated: {new Date().toLocaleString()}</p>
            <p className="mt-2"><strong>Account 1:</strong> ${reportPreview.account1.toFixed(2)}</p>
            <p><strong>Account 2:</strong> ${reportPreview.account2.toFixed(2)}</p>

            <h4 className="mt-4 font-semibold">Completed Payments</h4>
            {reportPreview.completedPayments.length === 0 ? (
              <p className="text-gray-500">No completed payments</p>
            ) : (
              <table className="w-full mt-2 border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Vendor</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {reportPreview.completedPayments.map(p => (
                    <tr key={p.id} className="border-t border-gray-200">
                      <td className="p-2">{p.vendorName}</td>
                      <td className="p-2 text-right">${p.amount.toFixed(2)}</td>
                      <td className="p-2">{new Date(p.date).toLocaleString()}</td>
                      <td className="p-2">{p.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
