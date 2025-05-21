// import HomeHeader from "components/header/HomeHeader";
import PostForm from "components/posts/PostForm";
import PostList from "components/posts/PostList";
import TabList from "components/tabs/TabList";
import AuthContext from "context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "firebaseApp";
import { TabType, useTabPosts } from "hooks/useTabPosts";
import { useContext, useEffect, useState } from "react";
// import PostsList from "pages/posts/list";

export type HomeTabType = "all" | "following";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.All);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const posts = useTabPosts({ user, followingList, activeTab });

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
          { key: TabType.All, content: "For you" },
          { key: TabType.Following, content: "Following" },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <PostForm mode="create" />
      <PostList posts={posts} noPostsMessage="게시글이 없습니다." />
    </>
  );
}
