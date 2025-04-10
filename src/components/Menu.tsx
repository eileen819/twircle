import { signOut } from "firebase/auth";
import { auth } from "firebaseApp";
import { FiUser } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { RiHome2Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function MenuBar() {
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut(auth);
    toast.success("로그아웃 되었습니다.");
  };

  return (
    <div className="footer">
      <button
        className="footer__icon footer__icon--active"
        onClick={() => navigate("/")}
      >
        <RiHome2Line />
      </button>
      <button className="footer__icon" onClick={() => navigate("/profile")}>
        <FiUser />
      </button>
      <button className="footer__icon" onClick={onSignOut}>
        <MdLogout />
      </button>
    </div>
  );
}
