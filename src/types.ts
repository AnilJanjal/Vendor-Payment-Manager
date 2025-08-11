export interface Vendor {
  id: string;
  index: number; // 1..n — used to apply scheduled rules (vendors 1..20)
  name: string;
  paymentType: "Weekly" | "Biweekly" | "On-Demand";
  assignedAccount: "Account 1" | "Account 2";
  skipNext?: boolean; // if true, skip next scheduled payment
}

export interface Payment {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending";
  type: "Scheduled" | "On-Demand";
}