import { IoArrowBack } from "react-icons/io5";
import styles from "./notificationsPage.module.scss";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import AuthContext from "context/AuthContext";
import { db } from "firebaseApp";
import NotificationBox from "components/notification/NotificationBox";
import { useTranslation } from "hooks/useTranslation";

export interface INotifications {
  id: string;
  type: string;
  toUid: string;
  fromUid: string;
  fromName: string;
  fromPhotoUrl: string;
  originalPost?: string;
  originalComment?: string;
  originalCommentImgUrl?: string;
  url: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<INotifications[] | null>(
    null
  );
  const translation = useTranslation();

  useEffect(() => {
    if (!user) return;
    const notiQuery = query(
      collection(db, "users", user?.uid, "notifications"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(notiQuery, (snapshot) => {
      const notisData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setNotifications(notisData as INotifications[]);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.back__icon} onClick={() => navigate(-1)}>
          <IoArrowBack size={20} />
        </div>
        <div className={styles.title}>
          {translation("HEADER_NOTIFICATIONS")}
        </div>
      </div>
      <div className={styles.main}>
        {notifications?.length !== 0 &&
          notifications?.map((noti) => (
            <NotificationBox key={noti.id} notification={noti} user={user} />
          ))}
      </div>
    </div>
  );
}
