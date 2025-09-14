import { createRoot } from "react-dom/client";
import "styles/reset.css";
import "styles/main.scss";
import { AuthContextProvider } from "context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import { LanguageContextProvider } from "context/LanguageContext";
import { FollowingProvider } from "context/FollowingContext";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthContextProvider>
      <FollowingProvider>
        <LanguageContextProvider>
          <App />
        </LanguageContextProvider>
      </FollowingProvider>
    </AuthContextProvider>
  </BrowserRouter>
);
