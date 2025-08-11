Excel Vendor Plugin – Payment & Bank Statement Manager
📌 Project Overview
This is a Microsoft Excel Task Pane Add-in built for the Finance Team to:

Manage vendor details and payments

Simulate bank account balances

Generate bank statement reports directly in Excel

The add-in is built using React + TypeScript + Office.js with Vite as the build tool and uses localStorage for data persistence.

🛠 Tech Stack
React – Task pane UI

TypeScript – Application logic

Office.js – Excel integration

Vite – Development & build tool

LocalStorage – Data persistence

excel-vendor-plugin/
│
├── certs/                         # SSL certificates for local development
│   ├── localhost-key.pem
│   └── localhost.pem
│
├── node_modules/                  # Installed dependencies
│
├── public/                       # Public static assets
│   └── vite.svg                  # Vite logo/icon
│
├── src/                         # Main source code folder
│   ├── assets/                   # Images, icons, or static assets (empty or used as needed)
│   │
│   ├── components/               # React UI components
│   │   ├── Login.tsx             # Login page component
│   │   ├── MainApp.tsx           # Main app container component after login
│   │   ├── OnDemandPayments.tsx  # Component to trigger manual/on-demand payments
│   │   ├── PaymentManager.tsx    # Component managing scheduled payments
│   │   ├── PaymentsHistory.tsx   # Displays vendor payment history
│   │   ├── PendingPayments.tsx   # Lists vendors with pending payments due to insufficient funds
│   │   └── VendorList.tsx        # Vendor list UI component
│   │
│   ├── services/                 # Business logic and Excel API integration
│   │   ├── ExcelService.ts       # Office.js integration, writes to Excel sheets, generates reports
│   │   └── VendorManager.ts      # Vendor CRUD operations and payment processing logic
│   │
│   ├── utils/                    # Utility/helper functions (empty or used as needed)
│   │
│   ├── App.css                  # Global styles for the app
│   ├── App.tsx                  # Root React component that manages login state and routing
│   ├── index.css                # Global CSS styles (if any)
│   ├── main.tsx                 # React DOM mounting entry point
│   ├── taskpane.html            # HTML file loaded into Excel task pane
│   ├── taskpane.tsx             # React app entry point for the task pane UI
│   ├── types.ts                 # TypeScript interfaces and types used throughout the app
│   └── vite-env.d.ts            # Vite TypeScript environment declarations
│
├── .gitignore                   # Files to ignore for git
├── eslint.config.js             # ESLint config file for linting
├── index.html                   # Main HTML entry file (if used for development)
├── manifest.xml                 # Excel add-in manifest file, configures add-in in Excel
├── package.json                 # Node.js project config, dependencies, scripts
├── package-lock.json            # Exact dependency versions
├── README.md                   # Project documentation
├── tsconfig.app.json            # TypeScript compiler options for the app

📄 Key Files Explained
Manifest & Entry Points
manifest.xml – Registers the add-in in Excel, defines permissions and task pane location.

taskpane.html – HTML file that loads your React app inside Excel.

taskpane.tsx – Mounts the React app in the task pane.

UI Components
Login.tsx – Handles authentication UI.

MainApp.tsx – Parent container after login; holds navigation & main content.

OnDemandPayments.tsx – UI for triggering immediate vendor payments.

PaymentManager.tsx – Schedules vendor payments (weekly, biweekly).

PaymentsHistory.tsx – Displays a history of completed payments.

PendingPayments.tsx – Shows vendors awaiting payment due to insufficient funds.

VendorList.tsx – Lists vendors and basic info.

Services
ExcelService.ts – Handles writing reports, account balances, and payment data to Excel via Office.js.

VendorManager.ts – Handles adding, updating, deleting vendors, and payment execution logic.

Utilities
types.ts – Defines data models like Vendor, Payment, etc.

App.tsx & main.tsx – Root React components and application mount.

🚀 Installation & Setup
1️⃣ Clone the Repo
bash

git clone <repository-url>
cd excel-vendor-plugin
2️⃣ Install Dependencies
bash

npm install
3️⃣ Run Locally
bash

npm run dev
4️⃣ Launch Excel with Add-in
bash

npm run start:addin
This will:

Build the project

Launch Excel with the add-in sideloaded

📄 Manual Sideload in Excel
If start:addin doesn’t work:

Open Excel

Go to Insert → My Add-ins → Upload My Add-in

Choose manifest.xml from the project folder

Your add-in will appear in Excel’s Home → Task Pane section

✅ Features
Authentication – Login/Logout

Vendor CRUD – Add, edit, delete vendors

Payment Scheduling – Weekly, biweekly, on-demand

Balance Simulation – Two accounts starting at $200k each

Pending Payments – For insufficient funds

Excel Export – Bank statement with payment details & history

📦 Deliverables
Source Code (TypeScript, HTML, manifest)

Sample Excel file with add-in loaded

README.md (this file)

Manifest.xml