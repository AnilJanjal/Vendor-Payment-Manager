// src/services/VendorManager.ts
import { 
    getVendorsFromLocalStorage, 
    syncLocalVendorsToExcel, 
    readVendorsFromSheet 
} from "./ExcelService";

/**
 * Initialize vendors data:
 * 1. If vendors exist in localStorage → sync to Excel.
 * 2. If no vendors in localStorage → read from Excel and store locally.
 */
export async function initVendorData() {
    const localVendors = getVendorsFromLocalStorage();

    if (localVendors.length > 0) {
        console.log("Found vendors in localStorage, syncing to Excel...");
        await syncLocalVendorsToExcel();
    } else {
        console.log("No vendors in localStorage, reading from Excel...");
        await readVendorsFromSheet();
    }
}
