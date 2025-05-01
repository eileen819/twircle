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
import { useNavigate } from "react-router-dom";
import { IUserProps } from "./edit";
import { DEFAULT_PROFILE_IMG_URL } from "components/users/SignupForm";

export default function ProfileDetail() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState<IPostProps[]>([]);
  const [userProfile, setUserProfile] = useState<IUserProps | null>(null);

  useEffect(() => {
    if (user) {
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
      if (user.uid) {
        getUser(user.uid);
      }
      const postsRef = collection(db, "posts");
      const postsQuery = query(
        postsRef,
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const dataObj = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPost(dataObj as IPostProps[]);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__header__back" onClick={() => navigate(-1)}>
          <IoArrowBack size={20} />
        </div>
        <div className="profile__header__title">
          {user?.displayName || userProfile?.displayName}
        </div>
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
              <img
                src={user?.photoURL || DEFAULT_PROFILE_IMG_URL}
                alt="profile-img"
                className="profile__image__default"
              />
            )}
          </div>
          <button
            className="profile__my-profile__box__edit-btn"
            onClick={() => navigate("/profile/edit")}
          >
            Profile Edit
          </button>
        </div>
        <div className="profile__my-profile__text">
          <div className="profile__my-profile__text__userName">
            {userProfile?.displayName || user?.displayName}
          </div>
          <div className="profile__my-profile__text__userEmail">
            {userProfile?.email || user?.email}
          </div>
          <div className="profile__my-profile__text__userBio">
            {userProfile?.bio || ""}
          </div>
        </div>
      </div>
      <div className="profile__tabs">
        <div className="profile__tab profile__tab--active">Posts</div>
        <div className="profile__tab">Likes</div>
      </div>
      <div className="profile__post-list">
        <PostList posts={post} noPostsMessage="게시글이 없습니다." />
      </div>
    </div>
  );
}
