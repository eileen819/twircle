import { INotifications } from "pages/notifications";
import styles from "./notificationBox.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { collection, doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import { User } from "firebase/auth";
import { toast } from "react-toastify";
import { LuMessageSquareText } from "react-icons/lu";
import { MdPersonAddAlt1 } from "react-icons/md";
import { useTruncateName } from "hooks/useTruncateName";

interface INotificationBoxProps {
  notification: INotifications;
  user: User | null;
}

export default function NotificationBox({
  notification,
  user,
}: INotificationBoxProps) {
  const navigate = useNavigate();

  const onClickNotification = async (notificationId: string, url: string) => {
    if (!user) return;
    try {
      const notificationRef = collection(
        db,
        "users",
        user.uid,
        "notifications"
      );
      const notificationSnap = doc(notificationRef, notificationId);
      await updateDoc(notificationSnap, {
        isRead: true,
      });
      navigate(url);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message);
      } else {
        toast.error("알림을 열 수 없습니다.");
      }
    }
  };

  return (
    <div
      className={`${styles.wrapper} ${
        notification.isRead === false ? styles.new : ""
      }`}
      onClick={() => onClickNotification(notification.id, notification.url)}
    >
      {notification.isRead === false && (
        <div className={styles.notification__unread} />
      )}
      <div className={styles.notifications}>
        <div className={styles.profileImg}>
          <Link
            to={`/profile/${notification.fromUid}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={notification.fromPhotoUrl} alt="profile_image" />
          </Link>
        </div>
        <div className={styles.notiContent}>
          <span className={styles.typeIcon}>
            {notification.type === "likes" && "❤️"}
            {notification.type === "comment" && (
              <LuMessageSquareText size={20} />
            )}
            {notification.type === "follow" && (
              <MdPersonAddAlt1 size={22} color="#0097e6" />
            )}
          </span>
          <Link
            to={`/profile/${notification.fromUid}`}
            onClick={(e) => e.stopPropagation()}
          >
            {useTruncateName(notification.fromName)}
          </Link>
          <span>{notification.content}</span>
        </div>
        {notification.originalPost && (
          <div className={styles.notiPost}>
            <div className={styles.post}>{notification.originalPost}</div>
          </div>
        )}
        {notification.originalComment && (
          <div className={styles.notiPost}>
            <div className={styles.post}>{notification.originalComment}</div>
            {notification.originalCommentImgUrl && (
              <div className={styles.postImg}>
                <img
                  src={notification.originalCommentImgUrl}
                  alt="post_image"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
