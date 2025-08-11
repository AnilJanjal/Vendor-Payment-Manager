// src/services/VendorManager.ts
import { 
    getVendorsFromLocalStorage, 
    syncLocalVendorsToExcel, 
    readVendorsFromSheet 
} from "./ExcelService";


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
