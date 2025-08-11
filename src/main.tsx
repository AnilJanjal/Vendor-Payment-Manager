import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);

function render() {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// If in dev mode (vite) → always render immediately
if (import.meta.env.DEV) {
  console.log("Development mode: rendering UI immediately");
  render();
} else {
  // In production (Excel add-in runtime)
  if (window.Office) {
    Office.onReady((info) => {
      if (info.host === Office.HostType.Excel) {
        console.log("Office is ready in Excel");
        render();
      }
    });
  } else {
    console.log("Running outside Office, rendering UI only");
    render();
  }
}
