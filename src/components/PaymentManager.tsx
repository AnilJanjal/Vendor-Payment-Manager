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

  const baseAmount = 100;

  useEffect(() => {
    const storedVendors = localStorage.getItem("vendors");
    if (storedVendors) setVendors(JSON.parse(storedVendors));

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
  const isFriday = today.getDay() === 5;
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
            newPayments.push({ vendorId: vendor.id, amount: payAmount, date: today.toISOString(), status: "Completed" });
          } else {
            newPayments.push({ vendorId: vendor.id, amount: payAmount, date: today.toISOString(), status: "Pending" });
          }
        } else {
          if (acc2Balance >= payAmount) {
            acc2Balance -= payAmount;
            newPayments.push({ vendorId: vendor.id, amount: payAmount, date: today.toISOString(), status: "Completed" });
          } else {
            newPayments.push({ vendorId: vendor.id, amount: payAmount, date: today.toISOString(), status: "Pending" });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">💳 Vendor Payment Manager</h2>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-600">Account Balances</h3>
          <p className="mt-2 text-gray-700">Account 1: <span className="font-bold">${account1Balance.toFixed(2)}</span></p>
          <p className="text-gray-700">Account 2: <span className="font-bold">${account2Balance.toFixed(2)}</span></p>
        </div>

        <button
          onClick={runScheduledPayments}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-all duration-200"
        >
          Run Scheduled Payments
        </button>

        <h3 className="text-lg font-semibold text-blue-600 mt-6 mb-2">Payments History</h3>
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {payments.map((p, i) => {
            const vendor = vendors.find((v) => v.id === p.vendorId);
            return (
              <li
                key={i}
                className={`p-3 rounded-lg shadow-sm flex justify-between items-center ${
                  p.status === "Completed" ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                <span>{vendor?.name || "Unknown Vendor"} - ${p.amount}</span>
                <span className="text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
