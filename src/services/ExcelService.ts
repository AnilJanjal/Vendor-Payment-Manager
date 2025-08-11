// src/services/ExcelService.ts
import type { Vendor, Payment } from "../types";

/* Helper: detect Office/Excel availability */
function officeAvailable(): boolean {
    try {
        // Excel global exists inside add-in runtime
        return typeof Excel !== "undefined" && typeof Excel.run === "function";
    } catch {
        return false;
    }
}

/* ===========================
   Local storage helpers
   =========================== */
export function saveVendorsToLocalStorage(vendors: Vendor[]) {
    localStorage.setItem("vendors", JSON.stringify(vendors));
}

export function getVendorsFromLocalStorage(): Vendor[] {
    try {
        const data = localStorage.getItem("vendors");
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/* ===========================
   Vendor <-> Excel sync
   =========================== */
export async function syncLocalVendorsToExcel(): Promise<void> {
    const vendors = getVendorsFromLocalStorage();
    if (vendors.length) {
        await writeVendorsToSheet(vendors);
    }
}

export async function writeVendorsToSheet(vendors: Vendor[]): Promise<void> {
    if (!officeAvailable()) {
        console.log("Office not available — skipping writeVendorsToSheet (saving to localStorage instead).");
        saveVendorsToLocalStorage(vendors);
        return;
    }

    try {
        console.log("writeVendorsToSheet called with:", vendors);
        await Excel.run(async (context) => {
            const sheet = context.workbook.worksheets.getActiveWorksheet();
            sheet.getRange("A1:D100").clear();

            const headerRange = sheet.getRange("A1:D1");
            headerRange.values = [["Name", "Payment Type", "Assigned Account", "Date Added"]];
            headerRange.format.font.bold = true;

            const today = new Date().toLocaleDateString();
            const data = vendors.map((v) => [v.name, v.paymentType, v.assignedAccount, today]);

            sheet.getRangeByIndexes(1, 0, data.length, 4).values = data;
            sheet.getUsedRange().format.autofitColumns();
            await context.sync();
            console.log("Vendors written to Excel with Date Added column");
        });
    } catch (error) {
        console.error("Error writing vendors to Excel:", error);
    }
}

export async function readVendorsFromSheet(): Promise<Vendor[]> {
    if (!officeAvailable()) {
        console.log("Office not available — reading vendors from localStorage.");
        return getVendorsFromLocalStorage();
    }

    try {
        return await Excel.run(async (context) => {
            const sheet = context.workbook.worksheets.getActiveWorksheet();
            const dataRange = sheet.getRange("A2:D100");
            dataRange.load("values");
            await context.sync();

            const values = dataRange.values || [];
            console.log("readVendorsFromSheet values:", values);

            const vendors: Vendor[] = values
                .filter((row) => row[0])
                .map((row, index) => ({
                    index, // ✅ add index property
                    id: Date.now().toString() + Math.random(),
                    name: row[0] as string,
                    paymentType: row[1] as "Weekly" | "Biweekly" | "On-Demand",
                    assignedAccount: row[2] as "Account 1" | "Account 2",
                }));

            saveVendorsToLocalStorage(vendors);
            console.log("Vendors read from Excel:", vendors);
            return vendors;
        });
    } catch (error) {
        console.error("Error reading vendors from Excel:", error);
        return [];
    }
}

/* ===========================
   Payments
   =========================== */
export async function writePaymentsToSheet(payments: Payment[]) {
    if (!officeAvailable()) {
        console.log("Office not available — saving payments to localStorage.");
        localStorage.setItem("paymentsHistory", JSON.stringify(payments));
        return;
    }

    try {
        await Excel.run(async (context) => {
            let sheet: Excel.Worksheet;
            try {
                sheet = context.workbook.worksheets.getItem("Payments");
                sheet.getRange("A1:F100").clear();
            } catch {
                sheet = context.workbook.worksheets.add("Payments");
            }

            sheet.getRange("A1:F1").values = [["Vendor ID", "Vendor Name", "Amount", "Date", "Status", "Type"]];
            const data = payments.map((p) => [p.vendorId, p.vendorName, p.amount, p.date, p.status, p.type]);
            if (data.length) sheet.getRangeByIndexes(1, 0, data.length, 6).values = data;

            await context.sync();
        });
    } catch (error) {
        console.error("Error writing payments to Excel:", error);
    }
}

export async function readPaymentsFromSheet(): Promise<Payment[]> {
    if (!officeAvailable()) {
        console.log("Office not available — reading payments from localStorage.");
        try {
            const stored = localStorage.getItem("paymentsHistory");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    try {
        return await Excel.run(async (context) => {
            let sheet: Excel.Worksheet;
            try {
                sheet = context.workbook.worksheets.getItem("Payments");
            } catch {
                console.log("Payments sheet not found");
                return [];
            }

            const dataRange = sheet.getRange("A2:F100");
            dataRange.load("values");
            await context.sync();

            const values = dataRange.values || [];
            const payments: Payment[] = values
                .filter((row: any[]) => row[0])
                .map((row: any[]) => ({
                    id: Date.now().toString() + Math.random(),
                    vendorId: row[0] as string,
                    vendorName: row[1] as string,
                    amount: Number(row[2]),
                    date: row[3] as string,
                    status: row[4] as "Completed" | "Pending",
                    type: row[5] as "Scheduled" | "On-Demand",
                }));

            console.log("Payments read from Excel:", payments);
            return payments;
        });
    } catch (error) {
        console.error("Error reading payments from Excel:", error);
        return [];
    }
}

/* ===========================
   Balances
   =========================== */
export async function writeBalancesToSheet(account1: number, account2: number) {
    if (!officeAvailable()) {
        console.log("Office not available — saving balances to localStorage.");
        localStorage.setItem("account1Balance", account1.toString());
        localStorage.setItem("account2Balance", account2.toString());
        return;
    }

    try {
        await Excel.run(async (context) => {
            let sheet: Excel.Worksheet;
            try {
                sheet = context.workbook.worksheets.getItem("Balances");
                sheet.getRange("A1:B3").clear();
            } catch {
                sheet = context.workbook.worksheets.add("Balances");
            }

            sheet.getRange("A1").values = [["Account"]];
            sheet.getRange("B1").values = [["Balance"]];
            sheet.getRange("A2").values = [["Account 1"]];
            sheet.getRange("A3").values = [["Account 2"]];
            sheet.getRange("B2").values = [[account1]];
            sheet.getRange("B3").values = [[account2]];

            await context.sync();
        });
    } catch (error) {
        console.error("Error writing balances to Excel:", error);
    }
}

export async function readBalancesFromSheet(): Promise<{ account1: number; account2: number }> {
    if (!officeAvailable()) {
        console.log("Office not available — reading balances from localStorage.");
        const a1 = Number(localStorage.getItem("account1Balance") ?? 200000);
        const a2 = Number(localStorage.getItem("account2Balance") ?? 200000);
        return { account1: a1, account2: a2 };
    }

    try {
        return await Excel.run(async (context) => {
            let sheet: Excel.Worksheet;
            try {
                sheet = context.workbook.worksheets.getItem("Balances");
            } catch {
                return { account1: 200000, account2: 200000 };
            }

            const range = sheet.getRange("B2:B3");
            range.load("values");
            await context.sync();

            const values = range.values || [];
            return {
                account1: Number(values[0]?.[0]) || 200000,
                account2: Number(values[1]?.[0]) || 200000,
            };
        });
    } catch (error) {
        console.error("Error reading balances from Excel:", error);
        return { account1: 200000, account2: 200000 };
    }
}

/* ===========================
   Current Report
   - Writes CurrentReport sheet in Excel when available
   - Fallback: downloads CSV (for browser testing) and returns
   =========================== */

function escapeCsvCell(value: any) {
    if (value === null || value === undefined) return "";
    const s = String(value);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

function downloadTextFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export async function writeReportToSheet(
    account1: number,
    account2: number,
    payments: Payment[],
    vendors?: Vendor[]
) {
    if (!officeAvailable()) {
        // Browser fallback: create a CSV with balances + completed payments
        console.log("Office not available — generating CSV report for download.");
        const lines: string[] = [];
        lines.push(`Report generated: ${new Date().toLocaleString()}`);
        lines.push("");
        lines.push("Balances");
        lines.push("Account, Balance");
        lines.push(`Account 1, ${account1}`);
        lines.push(`Account 2, ${account2}`);
        lines.push("");
        if (vendors && vendors.length) {
            lines.push("Vendors");
            lines.push("Name,Payment Type,Assigned Account");
            vendors.forEach(v => {
                lines.push(
                    [escapeCsvCell(v.name), escapeCsvCell(v.paymentType), escapeCsvCell(v.assignedAccount)].join(",")
                );
            });
            lines.push("");
        }
        lines.push("Completed Payments");
        lines.push("Vendor Name,Amount,Date,Status,Type");
        const completed = payments.filter(p => p.status === "Completed");
        if (completed.length === 0) {
            lines.push("No completed payments");
        } else {
            completed.forEach(p => {
                lines.push(
                    [
                        escapeCsvCell(p.vendorName),
                        escapeCsvCell(p.amount),
                        escapeCsvCell(p.date),
                        escapeCsvCell(p.status),
                        escapeCsvCell(p.type),
                    ].join(",")
                );
            });
        }
        downloadTextFile("CurrentReport.csv", lines.join("\n"));
        return;
    }

    // Office path: write into workbook
    try {
        await Excel.run(async (context) => {
            let sheet: Excel.Worksheet;
            try {
                sheet = context.workbook.worksheets.getItem("CurrentReport");
                sheet.getUsedRange().clear();
            } catch {
                sheet = context.workbook.worksheets.add("CurrentReport");
            }

            // Timestamp
            sheet.getRange("A1").values = [[`Report generated: ${new Date().toLocaleString()}`]];

            // Balances section
            sheet.getRange("A3:B3").values = [["Account", "Balance"]];
            sheet.getRange("A4:B5").values = [
                ["Account 1", account1],
                ["Account 2", account2],
            ];

            // Optional Vendors section (if passed)
            if (vendors && vendors.length) {
                sheet.getRange("D3:F3").values = [["Vendor", "Payment Type", "Account"]];
                const vdata = vendors.map(v => [v.name, v.paymentType, v.assignedAccount]);
                sheet.getRangeByIndexes(3, 3, vdata.length, 3).values = vdata; // row 4 (index 3)
            }

            // Payments section (starting at A7)
            sheet.getRange("A7:E7").values = [["Vendor Name", "Amount", "Date", "Status", "Type"]];
            const data = payments
                .filter((p) => p.status === "Completed")
                .map((p) => [p.vendorName, p.amount, p.date, p.status, p.type]);

            if (data.length > 0) {
                sheet.getRangeByIndexes(7, 0, data.length, 5).values = data;
            } else {
                sheet.getRange("A8").values = [["No completed payments"]];
            }

            sheet.getUsedRange().format.autofitColumns();

            // Activate the sheet so user sees it
            sheet.activate();
            await context.sync();
            console.log("CurrentReport written and activated in workbook.");
        });
    } catch (error) {
        console.error("Error writing report to Excel:", error);
        throw error;
    }
}
