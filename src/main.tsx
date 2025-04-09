// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "styles/reset.css";
import "index.scss";
import AppRouter from "routes/AppRouter";
import { AuthContextProvider } from "context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <AuthContextProvider>
    <AppRouter />
  </AuthContextProvider>
);
