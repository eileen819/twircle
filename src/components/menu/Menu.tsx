import styles from "./menu.module.scss";
import AuthContext from "context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "firebaseApp";
import { useContext, useState } from "react";
import { FiUser } from "react-icons/fi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { RiEnglishInput, RiHome2Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TbAlphabetKorean } from "react-icons/tb";
import { useLanguage } from "hooks/useLanguage";
import { useUnReadNotifications } from "hooks/useUnReadNotifications";

const enum MenuTabType {
  HOME = "home",
  SEARCH = "search",
  PROFILE = "profile",
  NOTIFICATIONS = "notifications",
  LANGUAGE = "language",
  SIGN_OUT = "signOut",
}

export default function MenuBar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { language, toggleLanguage } = useLanguage();
  const [activeIcon, setActiveIcon] = useState<MenuTabType>(MenuTabType.HOME);
  const hasUnRead = useUnReadNotifications(user?.uid);

  const handleLanguage = () => {
    setActiveIcon(MenuTabType.LANGUAGE);
    toggleLanguage();
  };

  const onClick = (url: string, tabName: MenuTabType) => {
    setActiveIcon(tabName);
    navigate(url);
  };

  const onSignOut = async () => {
    await signOut(auth);
    setActiveIcon(MenuTabType.SIGN_OUT);
    toast.success("로그아웃 되었습니다.");
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.icon} ${
          activeIcon === MenuTabType.HOME ? styles.active : ""
        }`}
        onClick={() => onClick("/", MenuTabType.HOME)}
      >
        <RiHome2Line />
      </button>
      <button
        className={`${styles.icon} ${
          activeIcon === MenuTabType.SEARCH ? styles.active : ""
        }`}
        onClick={() => onClick("/search", MenuTabType.SEARCH)}
      >
        <IoSearch />
      </button>
      <button
        className={`${styles.icon} ${
          activeIcon === MenuTabType.PROFILE ? styles.active : ""
        }`}
        onClick={() => onClick(`/profile/${user?.uid}`, MenuTabType.PROFILE)}
      >
        <FiUser />
      </button>
      <button
        className={`${styles.icon} ${
          activeIcon === MenuTabType.NOTIFICATIONS ? styles.active : ""
        }`}
        onClick={() => onClick(`/notifications`, MenuTabType.NOTIFICATIONS)}
      >
        <IoMdNotificationsOutline />
        {hasUnRead && <span className={styles.redDot} />}
      </button>
      <button
        className={`${styles.icon} ${styles.languageIcon} ${
          activeIcon === MenuTabType.LANGUAGE ? styles.active : ""
        }`}
        onClick={handleLanguage}
      >
        {language === "ko" ? <TbAlphabetKorean /> : <RiEnglishInput />}
      </button>
      <button
        className={`${styles.icon} ${
          activeIcon === MenuTabType.SIGN_OUT ? styles.active : ""
        }`}
        onClick={onSignOut}
      >
        <MdLogout />
      </button>
    </div>
  );
}
