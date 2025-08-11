import React, { useState } from "react";
import type { Vendor } from "../types";

interface VendorListProps {
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
}

export default function VendorList({ vendors, setVendors }: VendorListProps) {
  const [name, setName] = useState("");
  const [paymentType, setPaymentType] = useState<Vendor["paymentType"]>("Weekly");
  const [assignedAccount, setAssignedAccount] = useState<Vendor["assignedAccount"]>("Account 1");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPaymentType, setEditPaymentType] = useState<Vendor["paymentType"]>("Weekly");
  const [editAssignedAccount, setEditAssignedAccount] = useState<Vendor["assignedAccount"]>("Account 1");

  const addVendor = () => {
    if (!name) {
      alert("Vendor name is required");
      return;
    }
    const newVendor: Vendor = {
      id: Date.now().toString(),
      index: vendors.length + 1,
      name,
      paymentType,
      assignedAccount,
    };
    setVendors([...vendors, newVendor]);
    setName("");
  };

  const startEdit = (v: Vendor) => {
    setEditingId(v.id);
    setEditName(v.name);
    setEditPaymentType(v.paymentType);
    setEditAssignedAccount(v.assignedAccount);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setVendors((prev) =>
      prev.map((v) =>
        v.id === editingId
          ? { ...v, name: editName, paymentType: editPaymentType, assignedAccount: editAssignedAccount }
          : v
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => {
      const filtered = prev.filter((v) => v.id !== id);
      return filtered.map((v, i) => ({ ...v, index: i + 1 }));
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Vendor Management</h2>

      {/* Add Vendor Form */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Vendor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value as Vendor["paymentType"])}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Weekly">Weekly</option>
          <option value="Biweekly">Biweekly</option>
          <option value="On-Demand">On-Demand</option>
        </select>
        <select
          value={assignedAccount}
          onChange={(e) => setAssignedAccount(e.target.value as Vendor["assignedAccount"])}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Account 1">Account 1</option>
          <option value="Account 2">Account 2</option>
        </select>
        <button
          onClick={addVendor}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
        >
          Add Vendor
        </button>
      </div>

      {/* Vendor List */}
      <ul className="space-y-3">
        {vendors.map((v) => (
          <li
            key={v.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between"
          >
            {editingId === v.id ? (
              <div className="flex flex-wrap gap-3 flex-1">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
                />
                <select
                  value={editPaymentType}
                  onChange={(e) => setEditPaymentType(e.target.value as Vendor["paymentType"])}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Biweekly">Biweekly</option>
                  <option value="On-Demand">On-Demand</option>
                </select>
                <select
                  value={editAssignedAccount}
                  onChange={(e) => setEditAssignedAccount(e.target.value as Vendor["assignedAccount"])}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
                >
                  <option value="Account 1">Account 1</option>
                  <option value="Account 2">Account 2</option>
                </select>
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 bg-green-500 hover:bg-green-400 text-white rounded-lg font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 bg-gray-400 hover:bg-gray-300 text-white rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <span className="font-semibold">{v.index}. {v.name}</span> — {v.paymentType} — {v.assignedAccount}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(v)}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-white rounded-lg font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteVendor(v.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded-lg font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
