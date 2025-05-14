import styles from "./layout.module.scss";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import Loader from "../loader/Loader";
import MenuBar from "../menu/Menu";

export default function Layout() {
  const { isLoading } = useContext(AuthContext);

  return (
    <div className={styles.layout}>
      <div className={styles.title}>Twircle</div>
      <main className={styles.main}>
        <MenuBar />
        <div className={styles.timeLine}>
          {isLoading ? <Loader /> : <Outlet />}
        </div>
      </main>
    </div>
  );
}
