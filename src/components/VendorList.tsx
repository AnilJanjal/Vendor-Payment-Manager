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
      index: vendors.length + 1, // 1-based index
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
    setVendors(prev => prev.map(v => v.id === editingId
      ? { ...v, name: editName, paymentType: editPaymentType, assignedAccount: editAssignedAccount }
      : v));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteVendor = (id: string) => {
    // remove vendor and reindex remaining vendors
    setVendors(prev => {
      const filtered = prev.filter(v => v.id !== id);
      return filtered.map((v, i) => ({ ...v, index: i + 1 }));
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Vendor Management</h2>

      <input
        type="text"
        placeholder="Vendor Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <select value={paymentType} onChange={e => setPaymentType(e.target.value as Vendor["paymentType"])}>
        <option value="Weekly">Weekly</option>
        <option value="Biweekly">Biweekly</option>
        <option value="On-Demand">On-Demand</option>
      </select>
      <select value={assignedAccount} onChange={e => setAssignedAccount(e.target.value as Vendor["assignedAccount"])}>
        <option value="Account 1">Account 1</option>
        <option value="Account 2">Account 2</option>
      </select>
      <button onClick={addVendor}>Add Vendor</button>

      <ul>
        {vendors.map(v => (
          <li key={v.id} style={{ marginBottom: 10 }}>
            {editingId === v.id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} />
                <select value={editPaymentType} onChange={e => setEditPaymentType(e.target.value as Vendor["paymentType"])}>
                  <option value="Weekly">Weekly</option>
                  <option value="Biweekly">Biweekly</option>
                  <option value="On-Demand">On-Demand</option>
                </select>
                <select value={editAssignedAccount} onChange={e => setEditAssignedAccount(e.target.value as Vendor["assignedAccount"])}>
                  <option value="Account 1">Account 1</option>
                  <option value="Account 2">Account 2</option>
                </select>
                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                {v.index}. {v.name} — {v.paymentType} — {v.assignedAccount}
                <button style={{ marginLeft: 8 }} onClick={() => startEdit(v)}>Edit</button>
                <button style={{ marginLeft: 8 }} onClick={() => deleteVendor(v.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
