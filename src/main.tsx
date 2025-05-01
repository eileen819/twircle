// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "styles/reset.css";
import "index.scss";
import { AuthContextProvider } from "context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import App from "App";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </BrowserRouter>
);
