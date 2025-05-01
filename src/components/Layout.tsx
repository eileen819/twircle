import { Outlet, useMatch } from "react-router-dom";
import MenuBar from "./Menu";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import Loader from "./loader/Loader";

export default function Layout() {
  const { user, isLoading } = useContext(AuthContext);
  const imgDetailMatch = useMatch("/posts/:id/*");
  return (
    <div className="layout">
      <main>{isLoading ? <Loader /> : <Outlet />}</main>
      {user && !imgDetailMatch && <MenuBar />}
    </div>
  );
}
