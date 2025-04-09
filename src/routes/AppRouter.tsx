import AuthContext from "context/AuthContext";
import { useContext } from "react";
import { RouterProvider } from "react-router-dom";
import createAppRouter from "routes/router";

export default function AppRouter() {
  const { user } = useContext(AuthContext);
  const router = createAppRouter(!!user);
  return <RouterProvider router={router} />;
}
