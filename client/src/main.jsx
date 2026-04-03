import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1e293b",
          color: "#fff",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#6c63ff", secondary: "#fff" } },
      }}
    />
  </React.StrictMode>
);