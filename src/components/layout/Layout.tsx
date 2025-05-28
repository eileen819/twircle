import styles from "./layout.module.scss";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import Loader from "../loader/Loader";
import MenuBar from "../menu/Menu";
import { TbAlphabetKorean } from "react-icons/tb";
import { RiEnglishInput } from "react-icons/ri";
import { useLanguage } from "hooks/useLanguage";

export default function Layout() {
  const { user, isLoading } = useContext(AuthContext);
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <div className={styles.title}>Twircle</div>
        <button
          className={`${styles.icon} ${styles.languageIcon}`}
          onClick={toggleLanguage}
        >
          {language === "ko" ? <TbAlphabetKorean /> : <RiEnglishInput />}
        </button>
      </div>
      <main className={styles.main}>
        {user && <MenuBar />}
        <div className={styles.timeLine}>
          {isLoading ? <Loader /> : <Outlet />}
        </div>
      </main>
    </div>
  );
}
