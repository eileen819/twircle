import styles from "./menu.module.scss";
import AuthContext from "context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "firebaseApp";
import { useContext } from "react";
import { FiUser } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { RiHome2Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function MenuBar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const onSignOut = async () => {
    await signOut(auth);
    toast.success("로그아웃 되었습니다.");
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.icon} ${styles.active}`}
        onClick={() => navigate("/")}
      >
        <RiHome2Line />
      </button>
      <button className={styles.icon} onClick={() => navigate("/search")}>
        <IoSearch />
      </button>
      <button
        className={styles.icon}
        onClick={() => navigate(`/profile/${user?.uid}`)}
      >
        <FiUser />
      </button>
      <button className={styles.icon} onClick={onSignOut}>
        <MdLogout />
      </button>
    </div>
  );
}
