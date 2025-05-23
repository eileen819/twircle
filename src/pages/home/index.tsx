// import HomeHeader from "components/header/HomeHeader";
import PostForm from "components/posts/PostForm";
import PostList from "components/posts/PostList";
import TabList from "components/tabs/TabList";
import AuthContext from "context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "firebaseApp";
import { TabType, useTabPosts } from "hooks/useTabPosts";
import { useTranslation } from "hooks/useTranslation";
import { useContext, useEffect, useState } from "react";
// import PostsList from "pages/posts/list";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.All);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const posts = useTabPosts({ user, followingList, activeTab });
  const translation = useTranslation();

  useEffect(() => {
    if (!user) return;
    const followingRef = doc(db, "following", user.uid);
    const unsubscribe = onSnapshot(followingRef, (snapshot) => {
      const followingData = snapshot?.data()?.users || [];
      setFollowingList(followingData);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <TabList
        tabs={[
          { key: TabType.All, content: translation("TABS_HOME") },
          { key: TabType.Following, content: translation("TABS_FOLLOWING") },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <PostForm mode="create" />
      <PostList
        posts={posts}
        noPostsMessage={
          activeTab === TabType.All
            ? "게시글이 없습니다."
            : "팔로잉한 사용자가 없습니다."
        }
      />
    </>
  );
}
