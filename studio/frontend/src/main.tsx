// SPA entry. Installs the in-browser mock backend first (when enabled) so the app's
// socket/REST clients transparently hit the mock, then mounts React.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { installMock, isMockEnabled } from "./mockServer";
import "./studio.css";

if (isMockEnabled()) installMock();

const el = document.getElementById("root");
if (!el) throw new Error("studio: #root element not found");

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
