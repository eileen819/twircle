import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "styles/reset.css";
import "index.scss";
import { RouterProvider } from "react-router-dom";
import createAppRouter from "routes/router";

const router = createAppRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
