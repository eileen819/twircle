import styles from "./layout.module.scss";
import { Link, Outlet } from "react-router-dom";
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

  const year = new Date().getFullYear();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.title}>Twircle</div>
        <div className={styles.header__right}>
          {user && (
            <button className={styles.link__about}>
              <Link to="/about">About</Link>
            </button>
          )}
          <button
            className={`${styles.icon} ${styles.languageIcon}`}
            onClick={toggleLanguage}
          >
            {language === "ko" ? <TbAlphabetKorean /> : <RiEnglishInput />}
          </button>
        </div>
      </header>
      <main className={styles.main}>
        {user && <MenuBar />}
        <div className={styles.timeLine}>
          {isLoading ? <Loader /> : <Outlet />}
        </div>
      </main>
      {!user && (
        <footer className={styles.footer}>
          <div className={styles.copyright}>
            <span>&copy;{year} Twircle</span>
            <p>본 프로젝트는 학습용 데모이며 X(Twitter)와 무관합니다.</p>
          </div>
          <a
            href="https://github.com/eileen819"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.github}
          >
            <img src="/github-mark.png" alt="GitHub" />
          </a>
          <a href="mailto:eileen.ju.8819@gmail.com" className={styles.mail}>
            <span>✉️</span>
          </a>
        </footer>
      )}
    </div>
  );
}
