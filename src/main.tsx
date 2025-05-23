// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "styles/reset.css";
import "index.scss";
import "styles/main.scss";
import { AuthContextProvider } from "context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import { LanguageContextProvider } from "context/LanguageContext";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthContextProvider>
      <LanguageContextProvider>
        <App />
      </LanguageContextProvider>
    </AuthContextProvider>
  </BrowserRouter>
);
