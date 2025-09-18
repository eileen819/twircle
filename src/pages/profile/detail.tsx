import styles from "./detail.module.scss";
import PostList from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import { useContext, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { DEFAULT_PROFILE_IMG_URL } from "constants/constant";
import TabList from "components/tabs/TabList";
import { TabType, useTabPosts } from "hooks/useTabPosts";
import { useTranslation } from "hooks/useTranslation";
import { useUserProfile } from "hooks/useUserProfile";

export default function ProfileDetail() {
  const navigate = useNavigate();
  const { uid } = useParams();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.UserPosts);
  const { userProfile } = useUserProfile(uid);
  const posts = useTabPosts({ activeTab, user, uid });
  const translation = useTranslation();

  if (!user) return;

  return (
    <>
      <div className={styles.header}>
        <div className={styles.back__icon} onClick={() => navigate(-1)}>
          <IoArrowBack size={20} />
        </div>
        <div className={styles.title}>{userProfile?.displayName}</div>
      </div>
      <div className={styles.myProfile}>
        <div className={styles.profileBox}>
          <div className={styles.image}>
            {userProfile?.photoURL ? (
              <img
                src={userProfile?.photoURL}
                alt="profile-img"
                className={styles.userImg}
              />
            ) : (
              // 이 부분을 로더로 변경하기
              <img
                src={DEFAULT_PROFILE_IMG_URL}
                alt="profile-img"
                className={styles.defaultImg}
              />
            )}
          </div>
          {uid === user?.uid && (
            <button
              className={styles.editBtn}
              onClick={() => navigate(`/profile/${user?.uid}/edit`)}
            >
              {translation("BUTTON_PROFILE_EDIT")}
            </button>
          )}
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.userName}>{userProfile?.displayName}</div>
          <div className={styles.userEmail}>{userProfile?.email}</div>
          <div className={styles.userBio}>{userProfile?.bio || ""}</div>
        </div>
      </div>
      <TabList
        tabs={[
          { key: TabType.UserPosts, content: translation("TABS_POSTS") },
          { key: TabType.Liked, content: translation("TABS_LIKES") },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="profile__post-list">
        <PostList
          posts={posts}
          noPostsMessage={
            activeTab === TabType.UserPosts ? (
              <p>
                {translation("NOPOSTS_MESSAGE_HOME")}
                <br />
                {translation("NOPOSTS_MESSAGE_PROFILE")}
              </p>
            ) : (
              translation("NOPOSTS_MESSAGE_LIKES")
            )
          }
        />
      </div>
    </>
  );
}
