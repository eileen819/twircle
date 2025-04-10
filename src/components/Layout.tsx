import { Outlet } from "react-router-dom";
import MenuBar from "./Menu";
import { useContext } from "react";
import AuthContext from "context/AuthContext";

export default function Layout() {
  const { isLoading } = useContext(AuthContext);
  return (
    <div className="layout">
      <main>{isLoading ? <div>Loading...</div> : <Outlet />}</main>
      <MenuBar />
    </div>
  );
}
