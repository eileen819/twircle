import PostList, { IPostProps } from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { useContext, useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { IUserProps } from "./edit";
import { DEFAULT_PROFILE_IMG_URL } from "components/users/SignupForm";

type TabType = "my" | "likes";

export default function ProfileDetail() {
  const navigate = useNavigate();
  const { uid } = useParams();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<TabType>("my");
  const [post, setPost] = useState<IPostProps[]>([]);
  const [userProfile, setUserProfile] = useState<IUserProps | null>(null);

  useEffect(() => {
    if (!user || !uid) return;

    const getUser = async (uid: string) => {
      const userRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userRef);
      if (userDocSnap.exists()) {
        const userDate = {
          ...userDocSnap.data(),
        } as IUserProps;
        setUserProfile(userDate);
      }
    };
    if (uid) {
      getUser(uid);
    }

    const postsRef = collection(db, "posts");
    let postsQuery;

    if (activeTab === "my") {
      postsQuery = query(
        postsRef,
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
      );
    } else {
      postsQuery = query(
        postsRef,
        where("likes", "array-contains", uid),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const dataObj = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setPost(dataObj as IPostProps[]);
    });
    return () => unsubscribe();
  }, [activeTab, uid, user]);

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__header__back" onClick={() => navigate(-1)}>
          <IoArrowBack size={20} />
        </div>
        <div className="profile__header__title">{userProfile?.displayName}</div>
      </div>
      <div className="profile__my-profile">
        <div className="profile__my-profile__box">
          <div className="profile__my-profile__box__image">
            {userProfile?.photoURL ? (
              <img
                src={userProfile?.photoURL}
                alt="profile-img"
                className="profile__image"
              />
            ) : (
              // 이 부분을 로더로 변경하기
              <img
                src={DEFAULT_PROFILE_IMG_URL}
                alt="profile-img"
                className="profile__image__default"
              />
            )}
          </div>
          {uid === user?.uid && (
            <button
              className="profile__my-profile__box__edit-btn"
              onClick={() => navigate(`/profile/${user?.uid}/edit`)}
            >
              Profile Edit
            </button>
          )}
        </div>
        <div className="profile__my-profile__text">
          <div className="profile__my-profile__text__userName">
            {userProfile?.displayName}
          </div>
          <div className="profile__my-profile__text__userEmail">
            {userProfile?.email}
          </div>
          <div className="profile__my-profile__text__userBio">
            {userProfile?.bio || ""}
          </div>
        </div>
      </div>
      <div className="profile__tabs">
        <div
          className={`profile__tab ${activeTab === "my" ? "active" : ""}`}
          onClick={() => setActiveTab("my")}
        >
          Posts
        </div>
        <div
          className={`profile__tab ${activeTab === "likes" ? "active" : ""}`}
          onClick={() => setActiveTab("likes")}
        >
          Likes
        </div>
      </div>
      <div className="profile__post-list">
        <PostList
          posts={post}
          noPostsMessage={
            activeTab === "my"
              ? "게시글이 없습니다."
              : "'좋아요'를 누른 게시글이 없습니다."
          }
        />
      </div>
    </div>
  );
}
