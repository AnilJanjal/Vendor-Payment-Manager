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
        if (v?.length) {
          setVendors(v);
          localStorage.setItem("vendors", JSON.stringify(v));
        } else {
          const stored = localStorage.getItem("vendors");
          if (stored) {
            const localVendors = JSON.parse(stored);
            setVendors(localVendors);
            if (localVendors.length) {
              await writeVendorsToSheet(localVendors);
            }
          }
        }

        const p = await readPaymentsFromSheet();
        if (p?.length) {
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

  const onPayNow = async (vendor: Vendor, options?: { secure?: boolean; skipNext?: boolean }) => {
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

    if (options?.skipNext) {
      setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, skipNext: true } : v));
    }

    alert(sufficient ? `Paid $${amount} to ${vendor.name}` : `Insufficient funds for ${vendor.name}. Payment pending.`);
  };

  const runScheduledPayments = () => {
    const base = 200;
    const now = new Date();
    let newPayments: Payment[] = [];
    let updatedAcc1 = account1Balance;
    let summary = "";

    vendors.forEach(v => {
      if (v.paymentType === "On-Demand") return;
      if ((v as any).skipNext) {
        setVendors(prev => prev.map(x => x.id === v.id ? { ...x, skipNext: false } : x));
        summary += `${v.name}: skipped (skipNext)\n`;
        return;
      }

      const weekNumber = Math.floor(+now / (7 * 24 * 3600 * 1000));
      const isBiweeklyTurn = weekNumber % 2 === 0;

      let shouldPay = false;
      let amount = base;

      if (v.paymentType === "Weekly") shouldPay = true;
      if (v.paymentType === "Biweekly" && isBiweeklyTurn) shouldPay = true;

      if (!shouldPay) return;

      if (updatedAcc1 >= amount) {
        updatedAcc1 -= amount;
        newPayments.push({
          id: Date.now().toString() + Math.random(),
          vendorId: v.id,
          vendorName: v.name,
          amount,
          date: new Date().toISOString(),
          status: "Completed",
          type: "Scheduled",
        });
        summary += `${v.name}: Completed\n`;
      } else {
        newPayments.push({
          id: Date.now().toString() + Math.random(),
          vendorId: v.id,
          vendorName: v.name,
          amount,
          date: new Date().toISOString(),
          status: "Pending",
          type: "Scheduled",
        });
        summary += `${v.name}: Pending (insufficient funds)\n`;
      }
    });

    setAccount1Balance(updatedAcc1);
    setPaymentsHistory(prev => [...prev, ...newPayments]);
    alert(`Scheduled Payments Run:\n${summary || "No scheduled payments."}`);
  };

  const retryPending = async (payment: Payment) => {
    const vendor = findVendor(payment.vendorId);
    if (!vendor) return;

    const amount = payment.amount;
    let sufficient = false;

    if (vendor.assignedAccount === "Account 1") {
      if (account1Balance >= amount) {
        setAccount1Balance(prev => prev - amount);
        sufficient = true;
      }
    } else {
      if (account2Balance >= amount) {
        setAccount2Balance(prev => prev - amount);
        sufficient = true;
      }
    }

    setPaymentsHistory(prev =>
      prev.map(p => p.id === payment.id ? { ...p, status: sufficient ? "Completed" : "Pending" } : p)
    );

    alert(sufficient ? `Payment to ${payment.vendorName} completed on retry.` : `Still insufficient funds for ${payment.vendorName}.`);
  };

  const generateReport = async () => {
    const completed = paymentsHistory.filter(p => p.status === "Completed");
    setReportPreview({
      account1: account1Balance,
      account2: account2Balance,
      completedPayments: completed,
    });

    try {
      await writeReportToSheet(account1Balance, account2Balance, paymentsHistory, vendors);
      alert("Current Report written to workbook (sheet 'CurrentReport') or downloaded (browser).");
    } catch (err) {
      console.error("generateReport error:", err);
      alert("Failed to write report to Excel. See console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">🏦 Vendor Payment Manager</h1>

        <div className="space-y-6">
          <VendorList vendors={vendors} setVendors={setVendors} />

          <OnDemandPayments vendors={vendors} account2Balance={account2Balance} onPayNow={onPayNow} />

          <div className="flex space-x-3">
            <button
              onClick={runScheduledPayments}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
            >
              Run Scheduled Payments
            </button>
            <button
              onClick={generateReport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
            >
              Current Report
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700">💰 Account Balances</h2>
            <p className="mt-2 text-gray-800">Account 1: ${account1Balance.toFixed(2)}</p>
            <p className="text-gray-800">Account 2: ${account2Balance.toFixed(2)}</p>
          </div>

          <PaymentsHistory payments={paymentsHistory} vendorsList={vendors.map(v => ({ id: v.id, name: v.name }))} />

          <PendingPayments payments={paymentsHistory} onRetry={retryPending} />

          {reportPreview && (
            <div className="bg-white border rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800">📄 Report Preview</h3>
              <p className="text-sm text-gray-600">Generated: {new Date().toLocaleString()}</p>
              <p className="mt-2 font-semibold">Account 1: ${reportPreview.account1.toFixed(2)}</p>
              <p className="font-semibold">Account 2: ${reportPreview.account2.toFixed(2)}</p>

              <h4 className="mt-4 font-semibold">Completed Payments</h4>
              {reportPreview.completedPayments.length === 0 ? (
                <p className="text-gray-500">No completed payments</p>
              ) : (
                <table className="w-full mt-2 border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Vendor</th>
                      <th className="border p-2 text-right">Amount</th>
                      <th className="border p-2 text-left">Date</th>
                      <th className="border p-2 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportPreview.completedPayments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="border p-2">{p.vendorName}</td>
                        <td className="border p-2 text-right">${p.amount.toFixed(2)}</td>
                        <td className="border p-2">{new Date(p.date).toLocaleString()}</td>
                        <td className="border p-2">{p.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
