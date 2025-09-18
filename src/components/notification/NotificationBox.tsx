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
import { useTranslation } from "hooks/useTranslation";
import { DEFAULT_PROFILE_IMG_URL } from "constants/constant";
import { useUserProfile } from "hooks/useUserProfile";

interface INotificationBoxProps {
  notification: INotifications;
  user: User | null;
}

export default function NotificationBox({
  notification,
  user,
}: INotificationBoxProps) {
  const navigate = useNavigate();
  const translation = useTranslation();
  const { userProfile } = useUserProfile(notification.fromUid);
  const nameFromNoti = useTruncateName(userProfile?.displayName || "사용자");

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
      if (notification.type !== "follow") {
        navigate(url);
      }
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
            <img
              src={
                userProfile?.photoURL
                  ? userProfile.photoURL
                  : DEFAULT_PROFILE_IMG_URL
              }
              alt="profile_image"
            />
          </Link>
        </div>
        <div className={styles.notiContent}>
          {notification.type === "comment" && (
            <>
              <span className={styles.typeIcon}>
                <LuMessageSquareText size={20} />
              </span>
              <Link
                to={`/profile/${notification.fromUid}`}
                onClick={(e) => e.stopPropagation()}
              >
                {nameFromNoti}
              </Link>
              <span>{translation("NOTIFICATION_COMMENT")}</span>
            </>
          )}
          {notification.type === "likes" && (
            <>
              <span className={styles.typeIcon}>❤️</span>
              <Link
                to={`/profile/${notification.fromUid}`}
                onClick={(e) => e.stopPropagation()}
              >
                {nameFromNoti}
              </Link>
              <span>{translation("NOTIFICATION_LIKES")}</span>
            </>
          )}
          {notification.type === "follow" && (
            <>
              <span className={styles.typeIcon}>
                <MdPersonAddAlt1 size={22} color="#0097e6" />
              </span>
              <Link
                to={`/profile/${notification.fromUid}`}
                onClick={(e) => e.stopPropagation()}
              >
                {nameFromNoti}
              </Link>
              <span>{translation("NOTIFICATION_FOLLOW")}</span>
            </>
          )}
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
