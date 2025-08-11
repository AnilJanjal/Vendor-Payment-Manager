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

  // Report preview state (for UI)
  const [reportPreview, setReportPreview] = useState<{
    account1: number;
    account2: number;
    completedPayments: Payment[];
  } | null>(null);

  // Load vendors/payments/balances from Excel or localStorage
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

  // Sync vendors/payments/balances
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

  // helpers & payment flows (unchanged)
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

      // If you have vendor indices logic, adapt here. For now we pay scheduled types.
      if (v.paymentType === "Weekly") shouldPay = true;
      if (v.paymentType === "Biweekly") {
        if (isBiweeklyTurn) shouldPay = true;
      }

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

  // --- NEW: Generate Report (Excel + UI preview + browser fallback) ---
  const generateReport = async () => {
    // Prepare preview data (UI)
    const completed = paymentsHistory.filter(p => p.status === "Completed");
    setReportPreview({
      account1: account1Balance,
      account2: account2Balance,
      completedPayments: completed,
    });

    // Attempt to write into Excel (or fallback to CSV download)
    try {
      await writeReportToSheet(account1Balance, account2Balance, paymentsHistory, vendors);
      alert("Current Report written to workbook (sheet 'CurrentReport') or downloaded (browser).");
    } catch (err) {
      console.error("generateReport error:", err);
      alert("Failed to write report to Excel. See console for details. You should still see a preview in the UI.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Welcome to Vendor Payment Manager</h1>

      <VendorList vendors={vendors} setVendors={setVendors} />

      <OnDemandPayments vendors={vendors} account2Balance={account2Balance} onPayNow={onPayNow} />

      <div style={{ marginTop: 16 }}>
        <button onClick={runScheduledPayments}>Run Scheduled Payments</button>
        <button onClick={generateReport} style={{ marginLeft: 8 }}>Current Report</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Account Balances</h2>
        <p>Account 1: ${account1Balance.toFixed(2)}</p>
        <p>Account 2: ${account2Balance.toFixed(2)}</p>
      </div>

      <PaymentsHistory payments={paymentsHistory} vendorsList={vendors.map(v => ({ id: v.id, name: v.name }))} />

      <PendingPayments payments={paymentsHistory} onRetry={retryPending} />

      {/* Report preview UI */}
      {reportPreview && (
        <div style={{ marginTop: 20, borderTop: "1px solid #ddd", paddingTop: 12 }}>
          <h3>Report Preview</h3>
          <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Account 1:</strong> ${reportPreview.account1.toFixed(2)}</p>
          <p><strong>Account 2:</strong> ${reportPreview.account2.toFixed(2)}</p>

          <h4>Completed Payments</h4>
          {reportPreview.completedPayments.length === 0 ? (
            <p>No completed payments</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Vendor</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "right" }}>Amount</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Date</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {reportPreview.completedPayments.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: "6px 0" }}>{p.vendorName}</td>
                    <td style={{ padding: "6px 0", textAlign: "right" }}>${p.amount.toFixed(2)}</td>
                    <td style={{ padding: "6px 0" }}>{new Date(p.date).toLocaleString()}</td>
                    <td style={{ padding: "6px 0" }}>{p.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
