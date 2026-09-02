import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import UseProviders from "./context/UseProviders";

import "./assets/styles/index.css";
import "primeicons/primeicons.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UseProviders>
      <App />
    </UseProviders>
  </StrictMode>
);
