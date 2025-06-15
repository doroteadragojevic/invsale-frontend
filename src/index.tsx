import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HashRouter, BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";

// Ensure that the root element is correctly typed as HTMLDivElement
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
      <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();
