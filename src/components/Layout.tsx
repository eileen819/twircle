import { Outlet } from "react-router-dom";
import MenuBar from "./Menu";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import Loader from "./loader/Loader";

export default function Layout() {
  const { user, isLoading } = useContext(AuthContext);
  return (
    <div className="layout">
      <main>{isLoading ? <Loader /> : <Outlet />}</main>
      {user && <MenuBar />}
    </div>
  );
}
