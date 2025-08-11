import { useState, useEffect } from "react";

interface Vendor {
  id: string;
  name: string;
  paymentType: "Weekly" | "Biweekly" | "On-Demand";
  assignedAccount: "Account 1" | "Account 2";
}

interface Payment {
  vendorId: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending";
}

export default function PaymentManager() {
  const [account1Balance, setAccount1Balance] = useState(200000);
  const [account2Balance, setAccount2Balance] = useState(200000);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const baseAmount = 100; // base payment amount

  useEffect(() => {
    const storedVendors = localStorage.getItem("vendors");
    if (storedVendors) setVendors(JSON.parse(storedVendors));

    // Load saved account balances if you want persistence
    const savedAcc1 = localStorage.getItem("account1Balance");
    if (savedAcc1) setAccount1Balance(Number(savedAcc1));

    const savedAcc2 = localStorage.getItem("account2Balance");
    if (savedAcc2) setAccount2Balance(Number(savedAcc2));

    const savedPayments = localStorage.getItem("payments");
    if (savedPayments) setPayments(JSON.parse(savedPayments));
  }, []);

  useEffect(() => {
    localStorage.setItem("account1Balance", account1Balance.toString());
    localStorage.setItem("account2Balance", account2Balance.toString());
    localStorage.setItem("payments", JSON.stringify(payments));
  }, [account1Balance, account2Balance, payments]);

  const today = new Date();

  // Check if today is Friday (getDay() returns 5 for Friday)
  const isFriday = today.getDay() === 5;

  // Helper to check alternate Fridays (biweekly)
  // For simplicity, alternate Fridays can be every even week number.
  const weekNumber = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
  const isAlternateFriday = isFriday && weekNumber % 2 === 0;

  function runScheduledPayments() {
    if (!isFriday && !isAlternateFriday) {
      alert("Today is not a payment day.");
      return;
    }

    const newPayments: Payment[] = [];

    let acc1Balance = account1Balance;
    let acc2Balance = account2Balance;

    vendors.forEach((vendor, index) => {
      let payAmount = 0;
      let shouldPay = false;

      if (vendor.paymentType === "Weekly" && isFriday && index < 5) {
        payAmount = baseAmount;
        shouldPay = true;
      } else if (vendor.paymentType === "Biweekly" && isAlternateFriday && index >= 5 && index < 10) {
        payAmount = baseAmount * 2;
        shouldPay = true;
      }

      if (shouldPay) {
        const assignedAcc = vendor.assignedAccount;

        if (assignedAcc === "Account 1") {
          if (acc1Balance >= payAmount) {
            acc1Balance -= payAmount;
            newPayments.push({
              vendorId: vendor.id,
              amount: payAmount,
              date: today.toISOString(),
              status: "Completed",
            });
          } else {
            newPayments.push({
              vendorId: vendor.id,
              amount: payAmount,
              date: today.toISOString(),
              status: "Pending",
            });
          }
        } else {
          if (acc2Balance >= payAmount) {
            acc2Balance -= payAmount;
            newPayments.push({
              vendorId: vendor.id,
              amount: payAmount,
              date: today.toISOString(),
              status: "Completed",
            });
          } else {
            newPayments.push({
              vendorId: vendor.id,
              amount: payAmount,
              date: today.toISOString(),
              status: "Pending",
            });
          }
        }
      }
    });

    setAccount1Balance(acc1Balance);
    setAccount2Balance(acc2Balance);
    setPayments([...payments, ...newPayments]);

    alert("Scheduled payments processed.");
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Account Balances</h2>
      <p>Account 1: ${account1Balance.toFixed(2)}</p>
      <p>Account 2: ${account2Balance.toFixed(2)}</p>

      <button onClick={runScheduledPayments} style={{ marginTop: 20 }}>
        Run Scheduled Payments
      </button>

      <h3 style={{ marginTop: 20 }}>Payments History</h3>
      <ul>
        {payments.map((p, i) => {
          const vendor = vendors.find((v) => v.id === p.vendorId);
          return (
            <li key={i}>
              {vendor?.name || "Unknown Vendor"} - ${p.amount} - {new Date(p.date).toLocaleDateString()} - {p.status}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
