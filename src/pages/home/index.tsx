import PostForm from "components/posts/PostForm";
import PostList from "components/posts/PostList";
import TabList from "components/tabs/TabList";
import AuthContext from "context/AuthContext";
import FollowingContext from "context/FollowingContext";
import { TabType, useTabPosts } from "hooks/useTabPosts";
import { useTranslation } from "hooks/useTranslation";
import { useContext, useState } from "react";

export default function Home() {
  const { user } = useContext(AuthContext);
  const { followingList } = useContext(FollowingContext);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.All);
  const posts = useTabPosts({ user, followingList, activeTab });
  const translation = useTranslation();

  return (
    <>
      <title>Twircle | Home</title>
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
            ? translation("NOPOSTS_MESSAGE_HOME")
            : translation("NOPOSTS_MESSAGE_FOLLOWING")
        }
      />
    </>
  );
}
