import { FiUser } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { RiHome2Line } from "react-icons/ri";

export default function MenuBar() {
  return (
    <div className="footer">
      <button className="footer__icon footer__icon--active">
        <RiHome2Line />
      </button>
      <button className="footer__icon">
        <FiUser />
      </button>
      <button className="footer__icon">
        <MdLogout />
      </button>
    </div>
  );
}
